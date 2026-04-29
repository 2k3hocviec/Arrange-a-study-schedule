import { Classroom } from 'src/modules/classrooms/entities/classroom.entity';
import { Course } from 'src/modules/courses/entities/course.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Course)
  course_id!: Course;

  @ManyToOne(() => Classroom)
  classroom_id!: Classroom;

  @Column()
  dayOfWeek!: string;

  @Column()
  startTime!: string;

  @Column()
  endTime!: string;
}
