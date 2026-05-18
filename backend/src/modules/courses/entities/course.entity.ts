import { Schedule } from 'src/modules/schedules/entities/schedule.entity';
import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  course_id!: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject!: Subject;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: Teacher;

  @OneToMany(() => Schedule, (schedule) => schedule.course)
  schedule!: Schedule[];

  @Column()
  subject_id!: string;

  @Column()
  teacher_id!: string;

  @Column({ nullable: true })
  capacity?: number;

  @Column({ nullable: true })
  remaining_capacity?: number;
}
