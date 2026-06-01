import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { CoursesModule } from '../courses/courses.module';
import { ClassroomsModule } from '../classrooms/classrooms.module';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  imports: [CoursesModule, ClassroomsModule],
  exports: [SchedulesService],
})
export class SchedulesModule {}
