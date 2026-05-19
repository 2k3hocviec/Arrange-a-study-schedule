import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create-schedule.dto';
import { DayOfWeek } from '../entities/schedule.entity';
import { IsValidDateRange, IsValidSlotRange } from 'src/validation/validater';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  course_id!: string;
  classroom_id!: string;
  dayOfWeek!: DayOfWeek;
  @Type(() => Number)
  start_slot!: number;
  @Type(() => Number)
  @IsValidSlotRange()
  end_slot!: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  @IsValidDateRange()
  end_date?: string;
}
