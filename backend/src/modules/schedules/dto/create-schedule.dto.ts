import { DayOfWeek } from '../entities/schedule.entity';

export class CreateScheduleDto {
  course_id!: string;
  room_id!: string;
  dayOfWeek!: DayOfWeek;
  start_slot!: number;
  end_slot!: number;
}
