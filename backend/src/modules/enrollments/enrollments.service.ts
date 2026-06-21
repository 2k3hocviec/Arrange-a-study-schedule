import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { SchedulesService } from '../schedules/schedules.service';
import { StudentsService } from '../students/students.service';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
    private readonly scheduleService: SchedulesService,
  ) {}

  private hasDateOverlap(newSchedule: any, existingSchedule: any) {
    if (
      !newSchedule.start_date ||
      !newSchedule.end_date ||
      !existingSchedule.start_date ||
      !existingSchedule.end_date
    ) {
      return true;
    }

    const newStartDate = new Date(newSchedule.start_date);
    const newEndDate = new Date(newSchedule.end_date);
    const existingStartDate = new Date(existingSchedule.start_date);
    const existingEndDate = new Date(existingSchedule.end_date);

    return newStartDate <= existingEndDate && newEndDate >= existingStartDate;
  }

  async checkScheduleConflict(studentID: string, newCourseID: string) {
    const newCourse = await this.coursesService.findOneByCourseID(newCourseID);
    if (!newCourse) {
      throw new BadRequestException(`Course with ID ${newCourseID} not exist`);
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        student_id: studentID,
        course: { semester_id: newCourse.semester_id },
      },
      include: { course: { include: { subject: true } } },
    });

    const courseIDs = enrollments.map((e) => e.course_id);

    const existingSchedules =
      await this.scheduleService.findExistingSchedules(courseIDs);

    const newSchedules =
      await this.scheduleService.findSchedulesWithCourseID(newCourseID);

    if (newSchedules.length === 0) {
      throw new BadRequestException('This course has not yet been scheduled.');
    }

    for (const newSchedule of newSchedules) {
      for (const existingSchedule of existingSchedules) {
        const slotConflict =
          newSchedule.dayOfWeek === existingSchedule.dayOfWeek &&
          newSchedule.start_slot <= existingSchedule.end_slot &&
          newSchedule.end_slot >= existingSchedule.start_slot;

        if (
          slotConflict &&
          this.hasDateOverlap(newSchedule, existingSchedule)
        ) {
          return `Conflict with course with ID ${existingSchedule.course_id}`;
        }
      }
    }

    return null;
  }

  async create(
    createEnrollmentDto: CreateEnrollmentDto,
    options: { allowInactiveSemester?: boolean } = {},
  ) {
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

    const studentDepartmentId = student.class?.department_id;
    const subjectDepartmentId = course.subject?.department_id;
    if (
      !course.subject?.is_general &&
      studentDepartmentId !== subjectDepartmentId
    ) {
      throw new BadRequestException(
        'Subject is not available for this student department',
      );
    }

    if (!options.allowInactiveSemester && !course.semester?.is_active) {
      throw new BadRequestException(
        'This course is not in the active semester',
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
      where: {
        student_id: createEnrollmentDto.student_id,
        course: { semester_id: course.semester_id },
      },
      include: { course: { include: { subject: true } } },
    });

    const hasEnrolledSameCourse = existingEnrollments.some(
      (enrollment) => enrollment.course_id === createEnrollmentDto.course_id,
    );

    if (hasEnrolledSameCourse) {
      throw new BadRequestException(`This course has already been registered`);
    }

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

    // Đoạn code này sử transcion/lock kiểm soát nếu 2 người cùng đăng kí môn học tại cùng một thời điểm
    return this.prisma.$transaction(async (tx) => {
      if (
        course.remaining_capacity !== undefined &&
        course.remaining_capacity !== null
      ) {
        const capacityUpdate = await tx.course.updateMany({
          where: {
            course_id: createEnrollmentDto.course_id,
            remaining_capacity: { gt: 0 },
          },
          data: {
            remaining_capacity: { decrement: 1 },
          },
        });

        if (capacityUpdate.count === 0) {
          throw new BadRequestException('This course is fully booked');
        }
      }

      try {
        return await tx.enrollment.create({
          data: createEnrollmentDto,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new BadRequestException(
            'This course has already been registered',
          );
        }

        throw error;
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} enrollment`;
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return `This action updates a #${id} enrollment`;
  }

  async remove({
    studentId,
    courseId,
    allowInactiveSemester = false,
  }: {
    studentId: string;
    courseId: string;
    allowInactiveSemester?: boolean;
  }) {
    const course = await this.coursesService.findOneByCourseID(courseId);

    if (!course) {
      throw new BadRequestException(`Course with ID ${courseId} not exist`);
    }

    if (!allowInactiveSemester && !course.semester?.is_active) {
      throw new BadRequestException(
        'This course is not in the active semester',
      );
    }

    const result = await this.prisma.enrollment.deleteMany({
      where: {
        student_id: studentId,
        course_id: courseId,
      },
    });

    if (result.count > 0 && course && course.remaining_capacity !== undefined && course.remaining_capacity !== null) {
      const newRemaining = course.remaining_capacity + 1;
      if (course.capacity === undefined || course.capacity === null || newRemaining <= course.capacity) {
        await this.coursesService.updateRemaining(courseId, newRemaining);
      }
    }

    return result;
  }

  async findEnrollOfStudentId(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        student_id: studentId,
        course: { semester: { is_active: true } },
      },
    });
  }

  async findStudentCoursesWithDetails(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        student_id: studentId,
        course: { semester: { is_active: true } },
      },
      select: {
        student_id: true,
        enrollment_id: true,
        course_id: true,
        course: {
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
            course_code: true,
            subject_id: true,
            teacher_id: true,
          },
        },
      },
    });
  }
}
