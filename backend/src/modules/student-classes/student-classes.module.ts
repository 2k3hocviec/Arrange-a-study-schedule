import { Module } from '@nestjs/common';
import { StudentClassesController } from './student-classes.controller';
import { StudentClassesService } from './student-classes.service';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [DepartmentsModule],
  controllers: [StudentClassesController],
  providers: [StudentClassesService],
  exports: [StudentClassesService],
})
export class StudentClassesModule {}
