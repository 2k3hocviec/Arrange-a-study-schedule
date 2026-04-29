import { Subject } from 'src/modules/subjects/entities/subject.entity';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Subject)
  subject_id!: Subject;

  @ManyToOne(() => Teacher)
  teacher_id!: Teacher;
}
