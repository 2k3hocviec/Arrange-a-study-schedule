import { Module } from '@nestjs/common';
import { StudentClassesController } from './student-classes.controller';
import { StudentClassesService } from './student-classes.service';
import { MajorsModule } from '../majors/majors.module';

@Module({
  imports: [MajorsModule],
  controllers: [StudentClassesController],
  providers: [StudentClassesService],
  exports: [StudentClassesService],
})
export class StudentClassesModule {}
