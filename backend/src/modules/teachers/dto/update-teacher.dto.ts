import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  name!: string;
  degree!: string;
  expertise!: string;
  department_id!: string;
  user_id!: number;
}
