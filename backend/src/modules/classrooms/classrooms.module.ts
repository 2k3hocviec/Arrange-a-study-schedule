import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { Classroom } from './entities/classroom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
  imports: [TypeOrmModule.forFeature([Classroom])],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
