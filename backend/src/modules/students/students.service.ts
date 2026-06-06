import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UsersService } from '../users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const user = await this.userService.findOne(createStudentDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingStudent = await this.prisma.student.findUnique({
      where: { student_id: createStudentDto.student_id },
    });
    if (existingStudent) {
      throw new BadRequestException('Student already exists');
    }

    if (user.role !== 'student') {
      throw new BadRequestException('This user is not a student');
    }

    return this.prisma.student.create({ data: createStudentDto });
  }

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  findOneByStudentID(studentId: string) {
    return this.prisma.student.findUnique({ where: { student_id: studentId } });
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const user = await this.userService.findOne(updateStudentDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'student') {
      throw new BadRequestException('This Objects does not student');
    }

    const student = await this.findOneByStudentID(id);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.student.update({
      where: { student_id: id },
      data: updateStudentDto,
    });
  }

  async remove(studentId: string) {
    const student = await this.findOneByStudentID(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.prisma.student.delete({ where: { student_id: studentId } });
    return student;
  }

  async findByUserId(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
    });
    if (!student) {
      throw new NotFoundException('Student not found for this user');
    }
    return student;
  }
}
