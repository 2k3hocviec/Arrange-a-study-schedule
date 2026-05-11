import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { TeachersModule } from '../teachers/teachers.module';
import { TeachersService } from '../teachers/teachers.service';
import { SubjectsService } from '../subjects/subjects.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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

    return await this.courseRepository.save(createCourseDto);
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
    return await this.courseRepository.update(id, updateCourseDto);
  }

  async remove(id: string) {
    return await this.courseRepository.delete(id);
  }

  async findOneByCourseID(course_id: string) {
    return await this.courseRepository.findOne({
      where: { course_id: course_id },
    });
  }

  async findInfoCourse() {
    return this.courseRepository.find({
      relations: ['subject', 'teacher', 'schedule'],
      select: {
        course_id: true,
        subject: {
          subject_id: true,
          name: true,
          credits: true,
        },
        schedule: {
          schedule_id: true,
          dayOfWeek: true,
          start_slot: true,
          end_slot: true,
        },
      },
    });
  }
}
