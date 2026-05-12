import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../modules/enrollments/entities/enrollment.entity';
import { Course } from '../modules/courses/entities/course.entity';
import { Schedule } from '../modules/schedules/entities/schedule.entity';

@Injectable()
export class EnrollmentHelperService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  /**
   * Lấy tất cả môn học sinh viên đã đăng ký
   */
  async getStudentEnrollments(studentId: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { student_id: studentId },
      relations: ['course'],
    });

    const enrollmentsWithSchedule = await Promise.all(
      enrollments.map(async (enrollment) => {
        const schedule = await this.scheduleRepository.findOne({
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

  /**
   * Kiểm tra sinh viên đã đăng ký môn này chưa
   */

  async isAlreadyEnrolled(
    studentId: string,
    courseId: string,
  ): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { student_id: studentId, course_id: courseId },
    });
    return !!enrollment;
  }

  /**
   * Kiểm tra trùng lịch giữa môn mới và các môn đã đăng ký
   */
  async hasScheduleConflict(
    studentId: string,
    courseId: string,
  ): Promise<{ conflict: boolean; conflictWith?: string }> {
    // Lấy lịch của môn cần đăng ký
    const newCourseSchedule = await this.scheduleRepository.findOne({
      where: { course_id: courseId },
    });

    if (!newCourseSchedule) {
      return { conflict: false };
    }

    // Lấy tất cả môn sinh viên đã đăng ký
    const studentEnrollments = await this.getStudentEnrollments(studentId);

    // Check xung đột
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

  /**
   * Kiểm tra có thể đăng ký được không (toàn bộ điều kiện)
   */
  async canEnroll(
    studentId: string,
    courseId: string,
  ): Promise<{
    canEnroll: boolean;
    reason?: string;
  }> {
    // 1. Check môn đã đăng ký chưa
    const alreadyEnrolled = await this.isAlreadyEnrolled(studentId, courseId);
    if (alreadyEnrolled) {
      return {
        canEnroll: false,
        reason: 'Bạn đã đăng ký môn này rồi',
      };
    }

    // 2. Check trùng lịch
    const { conflict, conflictWith } = await this.hasScheduleConflict(
      studentId,
      courseId,
    );
    if (conflict) {
      return {
        canEnroll: false,
        reason: `Trùng lịch với môn ${conflictWith}`,
      };
    }

    // 4. Check tín chỉ
    const course = await this.courseRepository.findOne({
      where: { course_id: courseId },
      relations: ['subject'],
    });

    if (!course) {
      return {
        canEnroll: false,
        reason: 'Môn học không tồn tại',
      };
    }
    const courseCredits = course.subject?.credits || 0;

    // Nếu hết tất cả kiểm tra
    return {
      canEnroll: true,
    };
  }

  /**
   * Gợi ý các môn phù hợp trong những ngày rảnh
   */
  async suggestCoursesForFreeDays(studentId: string, freeDays: string[]) {
    const normalizeDay = (day: string): string => {
      if (
        day.toLowerCase().includes('chủ') ||
        day.toLowerCase().includes('nhật')
      )
        return '8';
      const match = day.match(/\d/);
      return match ? match[0] : day;
    };

    const normalizedFreeDays = freeDays.map(normalizeDay);

    // Lấy tất cả lịch công
    const allSchedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.course', 'course')
      .leftJoinAndSelect('course.subject', 'subject')
      .getMany();

    // Filter theo ngày rảnh
    const schedulesOnFreeDays = allSchedules.filter((s) =>
      normalizedFreeDays.includes(s.dayOfWeek),
    );

    // Kiểm tra từng môn
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

    // Lọc bỏ null và sort theo score
    return suggestions.filter((s) => s !== null).slice(0, 3); // Giới hạn 5 gợi ý
  }
}
