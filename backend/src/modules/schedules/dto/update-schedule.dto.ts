import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { CreateScheduleDto } from './create-schedule.dto';
import { DayOfWeek } from '../entities/schedule.entity';
import { IsValidSlotRange } from 'src/validation/validater';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  course_id!: string;
  classroom_id!: string;
  dayOfWeek!: DayOfWeek;
  @Type(() => Number)
  start_slot!: number;
  @Type(() => Number)
  @IsValidSlotRange()
  end_slot!: number;
}
