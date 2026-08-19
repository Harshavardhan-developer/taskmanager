import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task, TaskSchema } from './schemas/task.schema';
import { EmailModule } from '../email/email.module';
import { UploadModule } from '../upload/upload.module';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    EmailModule,
    UploadModule,
    WeatherModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
