import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Course } from '../courses/entities/course.entity';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Enrollment, Schedule, Course]),
    UsersModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
