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
   * Tính tổng tín chỉ sinh viên đã đăng ký
   */
  async getStudentTotalCredits(studentId: string): Promise<number> {
    const enrollments = await this.enrollmentRepository.find({
      where: { student_id: studentId },
      relations: ['course', 'course.subject'],
    });

    return enrollments.reduce((total, enrollment) => {
      const credits = enrollment.course?.subject?.credits || 0;
      return total + credits;
    }, 0);
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
   * Kiểm tra số chỗ còn trống của lớp học
   */
  async getCourseCapacity(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { course_id: courseId },
    });

    if (!course) {
      return { available: false, remaining: 0, capacity: 0, enrolled: 0 };
    }

    // Đếm số sinh viên đã đăng ký
    const enrolled = await this.enrollmentRepository.countBy({
      course_id: courseId,
    });

    // Lấy capacity từ course (nếu có field này)
    const capacity = (course as any).capacity || 60; // Default 60
    const remaining = capacity - enrolled;

    return {
      available: remaining > 0,
      remaining: Math.max(0, remaining),
      capacity,
      enrolled,
    };
  }

  /**
   * Kiểm tra có thể đăng ký được không (toàn bộ điều kiện)
   */
  async canEnroll(
    studentId: string,
    courseId: string,
    maxCredits: number = 18,
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

    // 3. Check chỗ trống
    const capacity = await this.getCourseCapacity(courseId);
    if (!capacity.available) {
      return {
        canEnroll: false,
        reason: 'Lớp học đã hết chỗ',
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

    const currentCredits = await this.getStudentTotalCredits(studentId);
    const courseCredits = course.subject?.credits || 0;

    if (currentCredits + courseCredits > maxCredits) {
      return {
        canEnroll: false,
        reason: `Vượt quá tín chỉ tối đa. Hiện tại: ${currentCredits}, thêm ${courseCredits} = ${currentCredits + courseCredits} (max ${maxCredits})`,
      };
    }

    // Nếu hết tất cả kiểm tra
    return {
      canEnroll: true,
    };
  }

  /**
   * Gợi ý các môn phù hợp trong những ngày rảnh
   */
  async suggestCoursesForFreeDays(
    studentId: string,
    freeDays: string[],
    maxCredits: number = 18,
  ) {
    // Lấy tất cả lịch công
    const allSchedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.course', 'course')
      .leftJoinAndSelect('course.subject', 'subject')
      .getMany();

    // Filter theo ngày rảnh
    const schedulesOnFreeDays = allSchedules.filter((s) =>
      freeDays.includes(s.dayOfWeek),
    );

    // Kiểm tra từng môn
    const suggestions = await Promise.all(
      schedulesOnFreeDays.map(async (schedule) => {
        const canEnroll = await this.canEnroll(
          studentId,
          schedule.course_id,
          maxCredits,
        );

        if (canEnroll.canEnroll) {
          const capacity = await this.getCourseCapacity(schedule.course_id);
          return {
            courseId: schedule.course_id,
            courseName: schedule.course?.subject_id,
            credits: schedule.course?.subject?.credits || 0,
            day: schedule.dayOfWeek,
            startSlot: schedule.start_slot,
            endSlot: schedule.end_slot,
            classroomId: schedule.classroom_id,
            remainingSeats: capacity.remaining,
            score: capacity.remaining, // Ưu tiên môn có chỗ ít
          };
        }

        return null;
      }),
    );

    // Lọc bỏ null và sort theo score
    return suggestions
      .filter((s) => s !== null)
      .sort((a, b) => (a?.score || 0) - (b?.score || 0))
      .slice(0, 5); // Giới hạn 5 gợi ý
  }
}
