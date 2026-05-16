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
      if (
        newSchedule.dayOfWeek === existingSchedule.dayOfWeek &&
        newSchedule.start_slot <= existingSchedule.start_slot &&
        newSchedule.end_slot >= existingSchedule.start_slot
      ) {
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
    const course = await this.coursesService.findOneByCourseID(
      createEnrollmentDto.course_id,
    );
    if (!course) {
      throw new BadRequestException(
        `Course with ID ${createEnrollmentDto.course_id} not exist`,
      );
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

    return await this.enrollmentRepository.save(enrollment);
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

  async remove({ student_id, course_id }) {
    return await this.enrollmentRepository.delete({
      student_id,
      course_id,
    });
  }

  async findEnrollOfStudentId(student_id: string) {
    return await this.enrollmentRepository.findBy({ student_id: student_id });
  }

  async findStudentCoursesWithDetails(student_id: string) {
    return await this.enrollmentRepository.find({
      where: { student_id: student_id },
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
          },
        },
      },
    });
  }
}
