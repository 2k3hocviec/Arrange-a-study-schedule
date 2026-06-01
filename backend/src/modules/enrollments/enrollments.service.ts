import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { SchedulesService } from '../schedules/schedules.service';
import { StudentsService } from '../students/students.service';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
    private readonly scheduleService: SchedulesService,
  ) {}

  async checkScheduleConflict(studentID: string, newCourseID: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { student_id: studentID },
      include: { course: { include: { subject: true } } },
    });

    const courseIDs = enrollments.map((e) => e.course_id);

    const existingSchedules =
      await this.scheduleService.findExistingSchedules(courseIDs);

    const newSchedule =
      await this.scheduleService.findScheduleWithCourseID(newCourseID);

    if (!newSchedule) {
      throw new Error('Mon nay chua co lich day');
    }

    for (const existingSchedule of existingSchedules) {
      const slotConflict =
        newSchedule.dayOfWeek === existingSchedule.dayOfWeek &&
        newSchedule.start_slot <= existingSchedule.start_slot &&
        newSchedule.end_slot >= existingSchedule.start_slot;

      if (!slotConflict) continue;

      if (newSchedule.start_date && newSchedule.end_date) {
        const newStartDate = new Date(newSchedule.start_date);
        const newEndDate = new Date(newSchedule.end_date);

        const existingStartDate = existingSchedule.start_date
          ? new Date(existingSchedule.start_date)
          : null;
        const existingEndDate = existingSchedule.end_date
          ? new Date(existingSchedule.end_date)
          : null;

        if (
          !existingStartDate ||
          !existingEndDate ||
          (existingStartDate <= newEndDate && existingEndDate >= newStartDate)
        ) {
          return `Conflict with ${existingSchedule.course_id}`;
        }
      } else {
        return `Conflict with ${existingSchedule.course_id}`;
      }
    }

    return null;
  }

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const student = await this.studentsService.findOneByStudentID(
      createEnrollmentDto.student_id,
    );
    if (!student) {
      throw new BadRequestException(
        `Student with ID ${createEnrollmentDto.student_id} not exist`,
      );
    }

    const course = await this.coursesService.findOneByCourseIDWithSubject(
      createEnrollmentDto.course_id,
    );
    if (!course) {
      throw new BadRequestException(
        `Course with ID ${createEnrollmentDto.course_id} not exist`,
      );
    }

    if (
      course.remaining_capacity !== undefined &&
      course.remaining_capacity !== null &&
      course.remaining_capacity <= 0
    ) {
      throw new BadRequestException('This course is fully booked');
    }

    const existingEnrollments = await this.prisma.enrollment.findMany({
      where: { student_id: createEnrollmentDto.student_id },
      include: { course: { include: { subject: true } } },
    });

    const hasEnrolledSameSubject = existingEnrollments.some(
      (enrollment) => enrollment.course.subject_id === course.subject_id,
    );

    if (hasEnrolledSameSubject) {
      throw new BadRequestException(`This subject has been registed`);
    }

    const totalCurrentCredits = existingEnrollments.reduce(
      (sum, enrollment) => {
        return sum + (enrollment.course.subject?.credits || 0);
      },
      0,
    );

    const newCourseCredits = course.subject?.credits || 0;
    const totalCreditsAfterEnroll = totalCurrentCredits + newCourseCredits;

    if (totalCreditsAfterEnroll > 18) {
      throw new BadRequestException(`Over max 18 credit`);
    }

    const conflict = await this.checkScheduleConflict(
      createEnrollmentDto.student_id,
      createEnrollmentDto.course_id,
    );

    if (conflict) {
      throw new BadRequestException(conflict);
    }

    const savedEnrollment = await this.prisma.enrollment.create({
      data: createEnrollmentDto,
    });

    if (course.remaining_capacity !== undefined && course.remaining_capacity !== null) {
      await this.coursesService.updateRemaining(
        createEnrollmentDto.course_id,
        course.remaining_capacity - 1,
      );
    }

    return savedEnrollment;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrollment`;
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return `This action updates a #${id} enrollment`;
  }

  async remove({ studentId, courseId }) {
    const course = await this.coursesService.findOneByCourseID(courseId);

    const result = await this.prisma.enrollment.deleteMany({
      where: {
        student_id: studentId,
        course_id: courseId,
      },
    });

    if (course && course.remaining_capacity !== undefined && course.remaining_capacity !== null) {
      const newRemaining = course.remaining_capacity + 1;
      if (course.capacity === undefined || course.capacity === null || newRemaining <= course.capacity) {
        await this.coursesService.updateRemaining(courseId, newRemaining);
      }
    }

    return result;
  }

  async findEnrollOfStudentId(studentId: string) {
    return this.prisma.enrollment.findMany({ where: { student_id: studentId } });
  }

  async findStudentCoursesWithDetails(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { student_id: studentId },
      select: {
        student_id: true,
        enrollment_id: true,
        course_id: true,
        course: {
          select: {
            course_id: true,
            subject_id: true,
            teacher_id: true,
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

  async findAllEnrollCourse() {
    return this.prisma.enrollment.findMany({
      select: {
        student_id: true,
        enrollment_id: true,
        course_id: true,
        createdAt: true,
        course: {
          select: {
            course_id: true,
            subject_id: true,
            teacher_id: true,
          },
        },
      },
    });
  }
}
