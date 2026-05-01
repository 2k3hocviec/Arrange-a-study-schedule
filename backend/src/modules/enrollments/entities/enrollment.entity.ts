import { Course } from 'src/modules/courses/entities/course.entity';
import { Student } from 'src/modules/students/entities/student.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student_id!: Student;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course_id!: Course;
}
