import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { UsersModule } from '../users/users.module';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
  imports: [UsersModule, DepartmentsModule],
  exports: [TeachersService],
})
export class TeachersModule {}
