import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { UsersService } from '../users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DepartmentsService } from '../departments/departments.service';

@Injectable()
export class TeachersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const user = await this.userService.findOne(createTeacherDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const teacher = await this.findOne(createTeacherDto.teacher_id);
    if (teacher) {
      throw new BadRequestException('Teacher already exists');
    }

    if (user.role !== 'teacher') {
      throw new BadRequestException('This Objects does not teacher');
    }

    await this.departmentsService.ensureExists(createTeacherDto.department_id);

    return this.prisma.teacher.create({ data: createTeacherDto });
  }

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        department: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.teacher.findUnique({
      where: { teacher_id: id },
      include: { department: true },
    });
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const user = await this.userService.findOne(updateTeacherDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'teacher') {
      throw new BadRequestException('This Objects does not teacher');
    }

    const teacher = await this.findOne(id);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const isChangingDepartment =
      updateTeacherDto.department_id &&
      updateTeacherDto.department_id !== teacher.department_id;

    if (isChangingDepartment) {
      const courseCount = await this.prisma.course.count({
        where: { teacher_id: id },
      });

      if (courseCount > 0) {
        throw new BadRequestException(
          'Cannot change department of teacher that has courses',
        );
      }
    }

    if (updateTeacherDto.department_id) {
      await this.departmentsService.ensureExists(updateTeacherDto.department_id);
    }

    return this.prisma.teacher.update({
      where: { teacher_id: id },
      data: updateTeacherDto,
    });
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);
    if (!teacher) {
      throw new NotFoundException('User not found');
    }

    const courseCount = await this.prisma.course.count({
      where: { teacher_id: id },
    });

    if (courseCount > 0) {
      throw new BadRequestException('Cannot delete teacher that has courses');
    }

    await this.prisma.teacher.delete({ where: { teacher_id: id } });
    return teacher;
  }

  async findTeacherCoursesWithDetails(teacherId: string) {
    return this.prisma.teacher.findUnique({
      where: { teacher_id: teacherId },
      select: {
        teacher_id: true,
        course: {
          where: { semester: { is_active: true } },
          select: {
            course_id: true,
            course_code: true,
            subject_id: true,
            teacher_id: true,
            semester_id: true,
            semester: {
              select: {
                semester_id: true,
                name: true,
                school_year: true,
                is_active: true,
              },
            },
            subject: {
              select: {
                subject_id: true,
                name: true,
                credits: true,
              },
            },
            schedule: {
              select: {
                schedule_id: true,
                classroom_id: true,
                dayOfWeek: true,
                start_slot: true,
                end_slot: true,
                start_date: true,
                end_date: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { user_id: userId },
      include: { department: true },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found for this user');
    }
    return teacher;
  }

  async findAllId() {
    return this.prisma.teacher.findMany({
      select: { teacher_id: true, name: true, department_id: true },
    });
  }
}
