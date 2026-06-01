import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TeachersModule } from '../teachers/teachers.module';
import { SubjectsModule } from '../subjects/subjects.module';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [TeachersModule, SubjectsModule],
  exports: [CoursesService],
})
export class CoursesModule {}
