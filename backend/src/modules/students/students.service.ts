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

  findAll() {
    return `This action returns all students`;
  }

  findOneByStudentID(student_id: string) {
    return this.studentRepository.findOneBy({ student_id });
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }

  // async getStudentSchedule(studentId: number) {
  //   // Kiểm tra học sinh tồn tại
  //   const student = await this.studentRepository.findOneBy({ id: studentId });
  //   if (!student) {
  //     throw new NotFoundException(`Student with ID ${studentId} not found`);
  //   }

  //   // Tìm tất cả enrollments của học sinh
  //   const enrollments = await this.enrollmentRepository.find({
  //     where: { student_id: { id: studentId } },
  //     relations: ['course_id'],
  //   });

  //   if (enrollments.length === 0) {
  //     return { message: 'No courses enrolled', schedules: [] };
  //   }

  //   // Lấy tất cả course IDs
  //   const courseIds = enrollments.map((e) => e.course_id.id);

  //   // Tìm schedules cho những courses này
  //   const schedules = await this.scheduleRepository.find({
  //     where: courseIds.map((courseId) => ({ course_id: { id: courseId } })),
  //     relations: ['course_id', 'classroom_id'],
  //   });

  //   return {
  //     studentId,
  //     studentName: student.name,
  //     enrollments: enrollments.length,
  //     schedules,
  //   };
  // }

  // async getStudentCourse(id: string) {
  //   const student = await this.studentRepository.findOneBy({
  //     student_id: id,
  //   });
  //   if (!student) {
  //     throw new NotFoundException(`Student with ID ${id} not found`);
  //   }

  //   //  Tìm tất cả enrollments của học sinh
  //   const enrollments = await this.enrollmentRepository.find({
  //     where: { student_id: { student_id: id } },
  //     relations: ['course_id'],
  //   });

  //   console.log(student);

  //   return enrollments;
  // }
}
