import { Module } from '@nestjs/common';
import { TeachersModule } from '../teachers/teachers.module';
import { TeacherBusySchedulesController } from './teacher-busy-schedules.controller';
import { TeacherBusySchedulesService } from './teacher-busy-schedules.service';

@Module({
  imports: [TeachersModule],
  controllers: [TeacherBusySchedulesController],
  providers: [TeacherBusySchedulesService],
  exports: [TeacherBusySchedulesService],
})
export class TeacherBusySchedulesModule {}
