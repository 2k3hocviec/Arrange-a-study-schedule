import { Classroom } from 'src/modules/classrooms/entities/classroom.entity';
import { Course } from 'src/modules/courses/entities/course.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum DayOfWeek {
  MONDAY = '2',
  TUESDAY = '3',
  WEDNESDAY = '4',
  THURSDAY = '5',
  FRIDAY = '6',
  SATURDAY = '7',
  SUNDAY = '8',
}

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  schedule_id!: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column()
  course_id!: string;

  @ManyToOne(() => Classroom, (room) => room.schedule)
  @JoinColumn({ name: 'classroom_id' })
  room!: Classroom;

  @Column({ name: 'classroom_id' })
  classroom_id!: string;
  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek!: DayOfWeek;

  @Column()
  start_slot!: number;

  @Column()
  end_slot!: number;
}
