import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { TeachersService } from '../teachers/teachers.service';
import { SubjectsService } from '../subjects/subjects.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teacherService: TeachersService,
    private readonly subjectService: SubjectsService,
  ) {}

  private async generateCourseCode(subjectId: string) {
    const courses = await this.prisma.course.findMany({
      where: { subject_id: subjectId },
      select: { course_code: true },
    });

    const prefix = `${subjectId}-`;
    const maxGroupNumber = courses.reduce((max, course) => {
      if (!course.course_code?.startsWith(prefix)) {
        return max;
      }

      const groupNumber = Number(course.course_code.slice(prefix.length));
      return Number.isInteger(groupNumber) && groupNumber > max
        ? groupNumber
        : max;
    }, 0);

    return `${prefix}${String(maxGroupNumber + 1).padStart(2, '0')}`;
  }

  async create(createCourseDto: CreateCourseDto) {
    if (!createCourseDto.required_room_type) {
      throw new BadRequestException('Required room type is required');
    }

    const teacher = await this.teacherService.findOne(
      createCourseDto.teacher_id,
    );
    const subject = await this.subjectService.findOne(
      createCourseDto.subject_id,
    );

    if (!teacher || !subject) {
      throw new BadRequestException('Not teacher or Not subject');
    }

    const courseCode =
      createCourseDto.course_code?.trim() ||
      (await this.generateCourseCode(createCourseDto.subject_id));

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        course_code: courseCode,
        remaining_capacity: createCourseDto.capacity,
      },
    });
  }

  findAll() {
    return this.prisma.course.findMany({
      include: { subject: true, teacher: true },
    });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({ where: { course_id: id } });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    if (updateCourseDto.required_room_type === '') {
      throw new BadRequestException('Required room type is required');
    }

    const teacher = await this.teacherService.findOne(
      updateCourseDto.teacher_id,
    );
    const subject = await this.subjectService.findOne(
      updateCourseDto.subject_id,
    );
    if (!teacher || !subject) {
      throw new BadRequestException('Not teacher or Not subject');
    }

    if (updateCourseDto.capacity !== undefined) {
      const course = await this.findOneByCourseID(id);
      if (!course) {
        throw new BadRequestException('Course not found');
      }

      const enrollmentCount = await this.prisma.enrollment.count({
        where: { course_id: id },
      });

      if (enrollmentCount > updateCourseDto.capacity) {
        throw new BadRequestException(
          `Cannot update capacity to ${updateCourseDto.capacity}. There are already ${enrollmentCount} students enrolled. Capacity must be at least ${enrollmentCount}.`,
        );
      }

      return this.prisma.course.update({
        where: { course_id: id },
        data: {
          ...updateCourseDto,
          remaining_capacity: updateCourseDto.capacity - enrollmentCount,
        },
      });
    }

    return this.prisma.course.update({
      where: { course_id: id },
      data: updateCourseDto,
    });
  }

  async remove(id: string) {
    return this.prisma.course.delete({ where: { course_id: id } });
  }

  async findOneByCourseID(courseId: string) {
    return this.prisma.course.findUnique({ where: { course_id: courseId } });
  }

  async findOneByCourseIDWithSubject(courseId: string) {
    return this.prisma.course.findUnique({
      where: { course_id: courseId },
      include: { subject: true },
    });
  }

  async updateRemaining(courseId: string, remainingCapacity: number) {
    return this.prisma.course.update({
      where: { course_id: courseId },
      data: { remaining_capacity: remainingCapacity },
    });
  }

  async findInfoCourse() {
    return this.prisma.course.findMany({
      select: {
        course_id: true,
        course_code: true,
        capacity: true,
        remaining_capacity: true,
        required_room_type: true,
        subject: {
          select: {
            subject_id: true,
            name: true,
            credits: true,
          },
        },
        teacher: {
          select: {
            teacher_id: true,
            name: true,
          },
        },
        schedule: {
          select: {
            schedule_id: true,
            dayOfWeek: true,
            start_slot: true,
            end_slot: true,
            start_date: true,
            end_date: true,
          },
        },
      },
    });
  }
}
