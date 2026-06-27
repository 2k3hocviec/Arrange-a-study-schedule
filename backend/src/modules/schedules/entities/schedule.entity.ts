export enum DayOfWeek {
  MONDAY = '2',
  TUESDAY = '3',
  WEDNESDAY = '4',
  THURSDAY = '5',
  FRIDAY = '6',
  SATURDAY = '7',
  SUNDAY = '8',
}

export class Schedule {
  schedule_id!: string;
  course_id!: string;
  classroom_id!: string;
  dayOfWeek!: DayOfWeek;
  start_slot!: number;
  end_slot!: number;
  start_date!: Date | null;
  end_date!: Date | null;
}
