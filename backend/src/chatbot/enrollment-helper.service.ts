import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EnrollmentHelperService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentEnrollments(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { student_id: studentId },
      include: { course: true },
    });

    const enrollmentsWithSchedule = await Promise.all(
      enrollments.map(async (enrollment) => {
        const schedule = await this.prisma.schedule.findFirst({
          where: { course_id: enrollment.course_id },
        });

        return {
          enrollmentId: enrollment.enrollment_id,
          courseId: enrollment.course_id,
          courseName: enrollment.course?.subject_id,
          day: schedule?.dayOfWeek || 'TBD',
          startSlot: schedule?.start_slot || 0,
          endSlot: schedule?.end_slot || 0,
          enrolledAt: enrollment.createdAt,
        };
      }),
    );

    return enrollmentsWithSchedule;
  }

  async isAlreadyEnrolled(
    studentId: string,
    courseId: string,
  ): Promise<boolean> {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { student_id: studentId, course_id: courseId },
    });
    return !!enrollment;
  }

  async hasScheduleConflict(
    studentId: string,
    courseId: string,
  ): Promise<{ conflict: boolean; conflictWith?: string }> {
    const newCourseSchedule = await this.prisma.schedule.findFirst({
      where: { course_id: courseId },
    });

    if (!newCourseSchedule) {
      return { conflict: false };
    }

    const studentEnrollments = await this.getStudentEnrollments(studentId);

    for (const enrollment of studentEnrollments) {
      if (
        enrollment.day === newCourseSchedule.dayOfWeek &&
        !(
          enrollment.endSlot <= newCourseSchedule.start_slot ||
          enrollment.startSlot >= newCourseSchedule.end_slot
        )
      ) {
        return {
          conflict: true,
          conflictWith: enrollment.courseName,
        };
      }
    }

    return { conflict: false };
  }

  async canEnroll(
    studentId: string,
    courseId: string,
  ): Promise<{
    canEnroll: boolean;
    reason?: string;
  }> {
    const alreadyEnrolled = await this.isAlreadyEnrolled(studentId, courseId);
    if (alreadyEnrolled) {
      return {
        canEnroll: false,
        reason: 'Ban da dang ky mon nay roi',
      };
    }

    const { conflict, conflictWith } = await this.hasScheduleConflict(
      studentId,
      courseId,
    );
    if (conflict) {
      return {
        canEnroll: false,
        reason: `Trung lich voi mon ${conflictWith}`,
      };
    }

    const course = await this.prisma.course.findUnique({
      where: { course_id: courseId },
      include: { subject: true },
    });

    if (!course) {
      return {
        canEnroll: false,
        reason: 'Mon hoc khong ton tai',
      };
    }

    return {
      canEnroll: true,
    };
  }

  async suggestCoursesForFreeDays(studentId: string, freeDays: string[]) {
    const normalizeDay = (day: string): string => {
      if (
        day.toLowerCase().includes('chu') ||
        day.toLowerCase().includes('nhat')
      )
        return '8';
      const match = day.match(/\d/);
      return match ? match[0] : day;
    };

    const normalizedFreeDays = freeDays.map(normalizeDay);

    const allSchedules = await this.prisma.schedule.findMany({
      include: {
        course: {
          include: {
            subject: true,
          },
        },
      },
    });

    const schedulesOnFreeDays = allSchedules.filter((s) =>
      normalizedFreeDays.includes(s.dayOfWeek),
    );

    const suggestions = await Promise.all(
      schedulesOnFreeDays.map(async (schedule) => {
        const canEnroll = await this.canEnroll(studentId, schedule.course_id);

        if (canEnroll.canEnroll) {
          return {
            courseId: schedule.course_id,
            courseName: schedule.course?.subject_id,
            credits: schedule.course?.subject?.credits || 0,
            day: schedule.dayOfWeek,
            startSlot: schedule.start_slot,
            endSlot: schedule.end_slot,
            classroomId: schedule.classroom_id,
          };
        }

        return null;
      }),
    );

    return suggestions.filter((s) => s !== null).slice(0, 3);
  }
}
