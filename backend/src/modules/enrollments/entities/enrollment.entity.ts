import { Course } from 'src/modules/courses/entities/course.entity';
import { Student } from 'src/modules/students/entities/student.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Student)
  student_id!: Student;

  @ManyToOne(() => Course)
  course_id!: Course;
}
