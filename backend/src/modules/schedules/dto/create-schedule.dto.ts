import { Type } from 'class-transformer';
import { IsValidSlotRange } from 'src/validation/validater';
import { DayOfWeek } from '../entities/schedule.entity';

export class CreateScheduleDto {
  course_id!: string;
  classroom_id!: string;
  dayOfWeek!: DayOfWeek;
  @Type(() => Number)
  start_slot!: number;
  @Type(() => Number)
  @IsValidSlotRange()
  end_slot!: number;
}
