import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
  imports: [UsersModule],
  exports: [TeachersService],
})
export class TeachersModule {}
