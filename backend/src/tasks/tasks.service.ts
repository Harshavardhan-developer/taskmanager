import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { EmailService } from '../email/email.service';
import { UploadService } from '../upload/upload.service';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private emailService: EmailService,
    private uploadService: UploadService,
    private weatherService: WeatherService,
  ) {}

  async create(
    userId: string,
    userEmail: string,
    dto: CreateTaskDto,
    file?: Express.Multer.File,
  ) {
    let fileUrl: string | undefined;
    if (file) {
      fileUrl = await this.uploadService.uploadBuffer(file.buffer);
    }

    const task = await this.taskModel.create({
      ...dto,
      user: new Types.ObjectId(userId),
      fileUrl,
    });

    // Fire-and-forget: a slow/failed email must never block the response.
    this.emailService.sendTaskCreatedEmail(userEmail, task.title).catch(() => undefined);

    return this.attachWeather(task.toObject());
  }

  async findAll(userId: string, query: QueryTaskDto) {
    const { page = 1, limit = 10, status, priority, search, startDate, endDate, sortBy, sortOrder } = query;

    const filter: Record<string, any> = { user: new Types.ObjectId(userId) };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      this.taskModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.taskModel.countDocuments(filter),
    ]);

    const withWeather = await Promise.all(tasks.map((t) => this.attachWeather(t)));

    return {
      data: withWeather,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const task = await this.getOwnedTaskOrThrow(userId, id);
    return this.attachWeather(task.toObject());
  }

  async update(
    userId: string,
    userEmail: string,
    id: string,
    dto: UpdateTaskDto,
    file?: Express.Multer.File,
  ) {
    const task = await this.getOwnedTaskOrThrow(userId, id);
    const wasNotDone = task.status !== TaskStatus.DONE;

    if (file) {
      task.fileUrl = await this.uploadService.uploadBuffer(file.buffer);
    }

    Object.assign(task, dto);
    await task.save();

    if (wasNotDone && task.status === TaskStatus.DONE) {
      this.emailService.sendTaskCompletedEmail(userEmail, task.title).catch(() => undefined);
    }

    return this.attachWeather(task.toObject());
  }

  async remove(userId: string, id: string) {
    const task = await this.getOwnedTaskOrThrow(userId, id);
    await task.deleteOne();
    return { success: true };
  }

  private async getOwnedTaskOrThrow(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Task not found');
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    if (task.user.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }
    return task;
  }

  private async attachWeather(task: any) {
    if (!task.location) return { ...task, weather: null };
    const weather = await this.weatherService.getWeatherByCity(task.location);
    return { ...task, weather };
  }
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
