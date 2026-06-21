import { Module } from '@nestjs/common';
import { StudentClassesController } from './student-classes.controller';
import { StudentClassesService } from './student-classes.service';

@Module({
  controllers: [StudentClassesController],
  providers: [StudentClassesService],
  exports: [StudentClassesService],
})
export class StudentClassesModule {}
