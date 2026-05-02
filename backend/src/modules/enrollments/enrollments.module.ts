import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { SchedulesModule } from '../schedules/schedules.module';
import { UsersModule } from '../users/users.module';
import { StudentsModule } from '../students/students.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    SchedulesModule,
    StudentsModule,
    CoursesModule,
  ],
})
export class EnrollmentsModule {}
