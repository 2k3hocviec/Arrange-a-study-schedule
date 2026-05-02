import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { CoursesModule } from '../courses/courses.module';
import { Course } from '../courses/entities/course.entity';
import { Classroom } from '../classrooms/entities/classroom.entity';
import { ClassroomsModule } from '../classrooms/classrooms.module';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  imports: [
    TypeOrmModule.forFeature([Schedule, Course, Classroom]),
    CoursesModule,
    ClassroomsModule,
  ],
  exports: [SchedulesService],
})
export class SchedulesModule {}
