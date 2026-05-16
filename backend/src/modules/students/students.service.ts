import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly userService: UsersService,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const user = await this.userService.findOne(createStudentDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingStudent = await this.studentRepository.findOneBy({
      student_id: createStudentDto.student_id,
    });
    if (existingStudent) {
      throw new BadRequestException('Student already exists');
    }

    if (user.role !== 'student') {
      throw new BadRequestException('This user is not a student');
    }

    const newStudent = this.studentRepository.create(createStudentDto);

    return await this.studentRepository.save(newStudent);
  }

  async findAll() {
    return await this.studentRepository.find();
  }

  findOneByStudentID(studentId: string) {
    return this.studentRepository.findOneBy({ student_id: studentId });
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const user = await this.userService.findOne(updateStudentDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'student') {
      throw new BadRequestException('This Objects does not student');
    }

    const student = await this.studentRepository.findOneBy({ student_id: id });

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.studentRepository.update({ student_id: id }, updateStudentDto);
  }

  async remove(studentId: string) {
    const student = await this.studentRepository.findOneBy({
      student_id: studentId,
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.studentRepository.delete({ student_id: studentId });
  }

  async findByUserId(userId: number) {
    const student = await this.studentRepository.findOneBy({ user_id: userId });
    if (!student) {
      throw new NotFoundException('Student not found for this user');
    }
    return student;
  }
}
