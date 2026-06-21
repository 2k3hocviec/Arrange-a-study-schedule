import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { CoursesModule } from '../courses/courses.module';
import { ClassroomsModule } from '../classrooms/classrooms.module';
import { TeacherBusySchedulesModule } from '../teacher-busy-schedules/teacher-busy-schedules.module';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  imports: [CoursesModule, ClassroomsModule, TeacherBusySchedulesModule],
  exports: [SchedulesService],
})
export class SchedulesModule {}
