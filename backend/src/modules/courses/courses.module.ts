import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { TeachersModule } from '../teachers/teachers.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { Enrollment } from '../enrollments/entities/enrollment.entity';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [
    TypeOrmModule.forFeature([Course, Enrollment]),
    TeachersModule,
    SubjectsModule,
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
