import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create-schedule.dto';
import { DayOfWeek } from '../entities/schedule.entity';
import { IsValidSlotRange } from 'src/validation/validater';

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  course_id!: string;
  room_id!: string;
  dayOfWeek!: DayOfWeek;
  start_slot!: number;
  @IsValidSlotRange()
  end_slot!: number;
}
