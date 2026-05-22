import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { User } from './modules/users/entities/user.entity';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';
import { CoursesModule } from './modules/courses/courses.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { Student } from './modules/students/entities/student.entity';
import { Teacher } from './modules/teachers/entities/teacher.entity';
import { Subject } from './modules/subjects/entities/subject.entity';
import { Course } from './modules/courses/entities/course.entity';
import { Enrollment } from './modules/enrollments/entities/enrollment.entity';
import { Classroom } from './modules/classrooms/entities/classroom.entity';
import { Schedule } from './modules/schedules/entities/schedule.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guard/jwt.guard';
import { RoleGuard } from './guard/role.guard';
import { ChatbotModule } from './chatbot/chatbot.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school1',
      entities: [
        User,
        Student,
        Teacher,
        Subject,
        Course,
        Enrollment,
        Classroom,
        Schedule,
      ],
      synchronize: true,
      logging: ['error'],
      // logging: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Student,
      Teacher,
      Subject,
      Course,
      Enrollment,
      Classroom,
      Schedule,
    ]),
    UsersModule,
    StudentsModule,
    TeachersModule,
    SubjectsModule,
    ClassroomsModule,
    CoursesModule,
    SchedulesModule,
    EnrollmentsModule,
    AuthModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}
