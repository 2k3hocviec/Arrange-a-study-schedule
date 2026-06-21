import { PartialType } from '@nestjs/mapped-types';
import { CreateSubjectDto } from './create-subject.dto';

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {
  name!: string;
  credits!: number;
  major_id!: string;
  allow_same_major?: boolean;
  allow_same_department?: boolean;
}
