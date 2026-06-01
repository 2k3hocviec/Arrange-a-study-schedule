import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { ClassroomsModule } from './modules/classrooms/classrooms.module';
import { CoursesModule } from './modules/courses/courses.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guard/jwt.guard';
import { RoleGuard } from './guard/role.guard';
import { ChatbotModule } from './chatbot/chatbot.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
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
