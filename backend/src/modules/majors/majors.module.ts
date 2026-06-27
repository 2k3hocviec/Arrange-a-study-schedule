import { Module } from '@nestjs/common';
import { DepartmentsModule } from '../departments/departments.module';
import { MajorsController } from './majors.controller';
import { MajorsService } from './majors.service';

@Module({
  imports: [DepartmentsModule],
  controllers: [MajorsController],
  providers: [MajorsService],
  exports: [MajorsService],
})
export class MajorsModule {}
