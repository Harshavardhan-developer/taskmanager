import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: CreateTaskDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.tasksService.create(user.id, user.email, dto, file);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: QueryTaskDto) {
    return this.tasksService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tasksService.findOne(userId, id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @CurrentUser() user: { id: string; email: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.tasksService.update(user.id, user.email, id, dto, file);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.tasksService.remove(userId, id);
  }
}
