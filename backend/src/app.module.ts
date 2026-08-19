import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { EmailModule } from './email/email.module';
import { UploadModule } from './upload/upload.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/task-management',
    ),
    AuthModule,
    UsersModule,
    TasksModule,
    EmailModule,
    UploadModule,
    WeatherModule,
  ],
})
export class AppModule {}
