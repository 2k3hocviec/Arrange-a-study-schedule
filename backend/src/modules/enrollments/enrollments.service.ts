import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulesService } from '../schedules/schedules.service';
import { StudentsService } from '../students/students.service';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
    private readonly scheduleService: SchedulesService,
  ) {}

  async checkScheduleConflict(studentID: string, newCourseID: string) {
    const enrollments = await this.enrollmentRepository.find({
      where: { student_id: studentID },
      relations: ['course', 'course.subject'],
    });

    const courseIDs = enrollments.map((e) => e.course_id);

    const existingSchedules =
      await this.scheduleService.findExistingSchedules(courseIDs);

    const newSchedule =
      await this.scheduleService.findScheduleWithCourseID(newCourseID);

    if (!newSchedule) {
      throw new Error('Môn này chưa có lịch dạy');
    }

    for (const existingSchedule of existingSchedules) {
      // Kiểm tra xung đột slot
      const slotConflict =
        newSchedule.dayOfWeek === existingSchedule.dayOfWeek &&
        newSchedule.start_slot <= existingSchedule.start_slot &&
        newSchedule.end_slot >= existingSchedule.start_slot;

      if (!slotConflict) continue;

      // Nếu có xung đột slot, kiểm tra khoảng ngày
      // Chỉ xung đột ngày nếu:
      // - Schedule cũ không có ngày (NULL) hoặc
      // - Khoảng ngày overlap
      if (newSchedule.start_date && newSchedule.end_date) {
        const newStartDate = new Date(newSchedule.start_date);
        const newEndDate = new Date(newSchedule.end_date);

        const existingStartDate = existingSchedule.start_date
          ? new Date(existingSchedule.start_date)
          : null;
        const existingEndDate = existingSchedule.end_date
          ? new Date(existingSchedule.end_date)
          : null;

        // Nếu schedule cũ không có ngày hoặc khoảng ngày overlap → conflict
        if (
          !existingStartDate ||
          !existingEndDate ||
          (existingStartDate <= newEndDate && existingEndDate >= newStartDate)
        ) {
          return `Conflict with ${existingSchedule.course_id}`;
        }
      } else {
        // Schedule mới không có ngày → luôn conflict nếu slot trùng
        return `Conflict with ${existingSchedule.course_id}`;
      }
    }

    return null;
  }

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    // Kiểm tra student có tồn tại không
    const student = await this.studentsService.findOneByStudentID(
      createEnrollmentDto.student_id,
    );
    if (!student) {
      throw new BadRequestException(
        `Student with ID ${createEnrollmentDto.student_id} not exist`,
      );
    }

    // Kiểm tra course có tồn tại không
    const course = await this.coursesService.findOneByCourseIDWithSubject(
      createEnrollmentDto.course_id,
    );
    if (!course) {
      throw new BadRequestException(
        `Course with ID ${createEnrollmentDto.course_id} not exist`,
      );
    }

    // Kiểm tra còn chỗ trong khóa học không
    if (
      course.remaining_capacity !== undefined &&
      course.remaining_capacity <= 0
    ) {
      throw new BadRequestException('This course is fully booked');
    }

    // Kiểm tra sinh viên đã từng đăng ký môn học này (theo subject_id) chưa
    const existingEnrollments = await this.enrollmentRepository.find({
      where: { student_id: createEnrollmentDto.student_id },
      relations: ['course', 'course.subject'],
    });

    const hasEnrolledSameSubject = existingEnrollments.some(
      (enrollment) => enrollment.course.subject_id === course.subject_id,
    );

    if (hasEnrolledSameSubject) {
      throw new BadRequestException(`This subject has been registed`);
    }

    // Kiểm tra tổng số tín chỉ không vượt quá 18
    const totalCurrentCredits = existingEnrollments.reduce(
      (sum, enrollment) => {
        return sum + (enrollment.course.subject?.credits || 0);
      },
      0,
    );

    console.log(course);

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

    const enrollment =
      await this.enrollmentRepository.create(createEnrollmentDto);
    enrollment.createdAt = new Date();

    // Lưu enrollment
    const savedEnrollment = await this.enrollmentRepository.save(enrollment);

    // Giảm remaining_capacity của course
    if (course.remaining_capacity !== undefined) {
      const newRemaining = course.remaining_capacity - 1;
      await this.coursesService.updateRemaining(
        createEnrollmentDto.course_id,
        newRemaining,
      );
    }

    return savedEnrollment;
  }

  findAll() {
    return `This action returns all enrollments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enrollment`;
  }

  update(id: number, updateEnrollmentDto: UpdateEnrollmentDto) {
    return `This action updates a #${id} enrollment`;
  }

  async remove({ studentId, courseId }) {
    // Lấy thông tin course để tăng lại remaining_capacity
    const course = await this.coursesService.findOneByCourseID(courseId);

    const result = await this.enrollmentRepository.delete({
      student_id: studentId,
      course_id: courseId,
    });

    // Tăng lại remaining_capacity khi hủy đăng ký
    if (course && course.remaining_capacity !== undefined) {
      const newRemaining = course.remaining_capacity + 1;
      // Không vượt quá capacity ban đầu
      if (course.capacity === undefined || newRemaining <= course.capacity) {
        await this.coursesService.updateRemaining(courseId, newRemaining);
      }
    }

    return result;
  }

  async findEnrollOfStudentId(studentId: string) {
    return await this.enrollmentRepository.findBy({ student_id: studentId });
  }

  async findStudentCoursesWithDetails(studentId: string) {
    return await this.enrollmentRepository.find({
      where: { student_id: studentId },
      relations: ['course', 'course.schedule', 'course.subject'],
      select: {
        student_id: true,
        enrollment_id: true,
        course_id: true,
        course: {
          course_id: true,
          subject_id: true,
          teacher_id: true,
          subject: {
            subject_id: true,
            name: true,
            credits: true,
          },
          schedule: {
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
    });
  }
}
