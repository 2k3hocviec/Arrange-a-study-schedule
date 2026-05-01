import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryColumn()
  course_id!: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject!: Subject;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: Teacher;
}
