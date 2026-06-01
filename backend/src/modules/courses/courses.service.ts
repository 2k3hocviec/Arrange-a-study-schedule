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

  async create(createCourseDto: CreateCourseDto) {
    const teacher = await this.teacherService.findOne(
      createCourseDto.teacher_id,
    );
    const subject = await this.subjectService.findOne(
      createCourseDto.subject_id,
    );

    if (!teacher || !subject) {
      throw new BadRequestException('Not teacher or Not subject');
    }

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        remaining_capacity: createCourseDto.capacity,
      },
    });
  }

  findAll() {
    return this.prisma.course.findMany();
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({ where: { course_id: id } });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
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
        capacity: true,
        remaining_capacity: true,
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
