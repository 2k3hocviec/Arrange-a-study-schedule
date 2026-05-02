import { Course } from 'src/modules/courses/entities/course.entity';
import { Student } from 'src/modules/students/entities/student.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  enrollment_id!: string;

  @Column()
  student_id!: string;

  @Column()
  course_id!: string;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}
