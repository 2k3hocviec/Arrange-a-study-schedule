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

  /*
  Kiểm tra xem lớp học có còn chỗ trống không:
    - Nếu capacity = null hoặc undefined thì không kiểm tra
    - Nếu currentStudentId khác null thì trừ đi 1 sinh viên nếu có lỗi không thể kiểm tra được thì ném lỗi 
  */
  private async ensureClassCanAcceptStudent(
    classId: string,
    currentStudentId?: string,
  ) {
    if (!classId) {
      throw new BadRequestException('Student class is required');
    }

    const studentClass = await this.prisma.studentClass.findUnique({
      where: { class_id: classId },
      include: { _count: { select: { students: true } } },
    });

    if (!studentClass) {
      throw new BadRequestException('Student class not found');
    }

    if (studentClass.capacity === null || studentClass.capacity === undefined) {
      return;
    }

    const currentStudent = currentStudentId
      ? await this.prisma.student.findUnique({
          where: { student_id: currentStudentId },
          select: { class_id: true },
        })
      : null;

    const alreadyInClass = currentStudent?.class_id === classId;
    if (
      !alreadyInClass &&
      studentClass._count.students >= studentClass.capacity
    ) {
      throw new BadRequestException('Student class is full');
    }
  }

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

    await this.ensureClassCanAcceptStudent(createStudentDto.class_id);

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
        class: { include: { major: { include: { department: true } } } },
      },
    });
  }

  findOneByStudentID(studentId: string) {
    return this.prisma.student.findUnique({
      where: { student_id: studentId },
      include: {
        class: { include: { major: { include: { department: true } } } },
      },
    });
  }

  /*
  Cập nhật thông tin sinh viên:
    - Kiểm tra thông tin user
    - Kiểm tra thông tin sinh viên
    - Kiểm tra nếu chuyển lớp thì phải đảm bảo lớp đó còn chỗ trống
    - Kiểm tra sinh viên này đã có môn học nào đăng ký chưa nếu có thì không được thay đổi lớp
  */

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

    if (student.class_id !== updateStudentDto.class_id) {
      const enrollmentCount = await this.prisma.enrollment.count({
        where: { student_id: id },
      });
      if (enrollmentCount > 0) {
        throw new BadRequestException(
          'Cannot change student class when student has enrollments',
        );
      }
    }

    await this.ensureClassCanAcceptStudent(updateStudentDto.class_id, id);

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

    const enrollmentCount = await this.prisma.enrollment.count({
      where: { student_id: studentId },
    });

    if (enrollmentCount > 0) {
      throw new BadRequestException(
        'Cannot delete student that has enrollments',
      );
    }

    await this.prisma.student.delete({ where: { student_id: studentId } });
    return student;
  }

  async findByUserId(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        class: { include: { major: { include: { department: true } } } },
      },
    });
    if (!student) {
      throw new NotFoundException('Student not found for this user');
    }
    return student;
  }
}
