import { Student } from 'src/modules/students/entities/student.entity';
import { Teacher } from 'src/modules/teachers/entities/teacher.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToOne(() => Student, (student) => student.user)
  student!: Student;

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacher!: Teacher;

  @Column({ type: 'enum', enum: ['student', 'teacher', 'ministry', 'sysadmin'] })
  role!: string;
}
