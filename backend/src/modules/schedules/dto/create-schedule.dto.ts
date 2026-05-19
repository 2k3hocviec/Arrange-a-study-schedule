import { Type } from 'class-transformer';
import { IsValidSlotRange, IsValidDateRange } from 'src/validation/validater';
import { DayOfWeek } from '../entities/schedule.entity';
import { IsDateString, IsOptional } from 'class-validator';

export class CreateScheduleDto {
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
