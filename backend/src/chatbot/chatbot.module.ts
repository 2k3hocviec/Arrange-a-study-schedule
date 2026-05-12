import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { EnrollmentHelperService } from './enrollment-helper.service';
import { Schedule } from '../modules/schedules/entities/schedule.entity';
import { Course } from '../modules/courses/entities/course.entity';
import { Enrollment } from '../modules/enrollments/entities/enrollment.entity';
import { Subject } from 'rxjs';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Schedule, Course, Enrollment, Subject]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, EnrollmentHelperService],
})
export class ChatbotModule {}
