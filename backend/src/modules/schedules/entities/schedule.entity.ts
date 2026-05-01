import { Classroom } from 'src/modules/classrooms/entities/classroom.entity';
import { Course } from 'src/modules/courses/entities/course.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course_id!: Course;

  @ManyToOne(() => Classroom)
  classroom_id!: Classroom;

  @Column()
  dayOfWeek!: string;

  @Column({ type: 'enum', enum: ['Morning', 'Afternoon', 'Evening'] })
  role!: string;
}
