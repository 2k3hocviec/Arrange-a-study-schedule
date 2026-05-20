import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { TeachersModule } from '../teachers/teachers.module';
import { TeachersService } from '../teachers/teachers.service';
import { SubjectsService } from '../subjects/subjects.service';
import { Enrollment } from '../enrollments/entities/enrollment.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
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

    const courseData = {
      ...createCourseDto,
      remaining_capacity: createCourseDto.capacity,
    };

    return await this.courseRepository.save(courseData);
  }

  findAll() {
    return this.courseRepository.find();
  }

  findOne(id: string) {
    return this.courseRepository.findOneBy({ course_id: id });
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

    // Nếu có cập nhật capacity, kiểm tra số sinh viên đã đăng ký
    if (updateCourseDto.capacity !== undefined) {
      const course = await this.findOneByCourseID(id);
      if (!course) {
        throw new BadRequestException('Course not found');
      }

      // Đếm số sinh viên đã đăng ký cho khóa học này
      const enrollmentCount = await this.enrollmentRepository.count({
        where: { course_id: id },
      });

      // Nếu số sinh viên đã đăng ký > capacity mới, từ chối cập nhật
      if (enrollmentCount > updateCourseDto.capacity) {
        throw new BadRequestException(
          `Cannot update capacity to ${updateCourseDto.capacity}. There are already ${enrollmentCount} students enrolled. Capacity must be at least ${enrollmentCount}.`,
        );
      }

      // Tính toán remaining_capacity mới
      const usedCapacity = enrollmentCount;
      const newRemaining = updateCourseDto.capacity - usedCapacity;

      // Cập nhật course với remaining_capacity mới
      return await this.courseRepository.update(id, {
        ...updateCourseDto,
        remaining_capacity: newRemaining,
      });
    }

    // Nếu không cập nhật capacity, chỉ cập nhật thông tin khác
    return await this.courseRepository.update(id, updateCourseDto);
  }

  async remove(id: string) {
    return await this.courseRepository.delete(id);
  }

  async findOneByCourseID(courseId: string) {
    return await this.courseRepository.findOne({
      where: { course_id: courseId },
    });
  }

  async findOneByCourseIDWithSubject(courseId: string) {
    return await this.courseRepository.findOne({
      where: { course_id: courseId },
      relations: ['subject'],
    });
  }

  async updateRemaining(courseId: string, remainingCapacity: number) {
    return await this.courseRepository.update(
      { course_id: courseId },
      { remaining_capacity: remainingCapacity },
    );
  }

  async findInfoCourse() {
    return this.courseRepository.find({
      relations: ['subject', 'teacher', 'schedule'],
      select: {
        course_id: true,
        capacity: true,
        remaining_capacity: true,
        subject: {
          subject_id: true,
          name: true,
          credits: true,
        },
        teacher: {
          teacher_id: true,
          name: true,
        },
        schedule: {
          schedule_id: true,
          dayOfWeek: true,
          start_slot: true,
          end_slot: true,
          start_date: true,
          end_date: true,
        },
      },
    });
  }
}
