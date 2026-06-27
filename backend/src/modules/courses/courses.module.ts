import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TeachersModule } from '../teachers/teachers.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { SemestersModule } from '../semesters/semesters.module';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [TeachersModule, SubjectsModule, SemestersModule],
  exports: [CoursesService],
})
export class CoursesModule {}
