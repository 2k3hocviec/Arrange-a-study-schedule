import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { log } from 'console';
import { CoursesService } from '../courses/courses.service';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  private async checkClassroomConflict(dto: CreateScheduleDto) {
    return await this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.room_id = :roomId', { roomId: dto.room_id })
      .andWhere('schedule.dayOfWeek = :day', { day: String(dto.dayOfWeek) })
      .andWhere('schedule.start_slot < :endNew', { endNew: dto.end_slot })
      .andWhere('schedule.end_slot> :startNew', { startNew: dto.start_slot })
      .getOne();
  }

  private async checkTeacherConflict(dto: CreateScheduleDto) {
    // 1. Tìm thông tin khóa học hiện tại để biết giáo viên là ai
    const currentCourse = await this.courseRepository.findOne({
      where: { course_id: dto.course_id },
    });

    if (!currentCourse) return null;

    // 2. Tìm bất kỳ lịch dạy nào của giáo viên này bị trùng giờ
    // Sử dụng QueryBuilder để join sang bảng Course và check teacher_id
    const conflict = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.course', 'course')
      .where('schedule.dayOfWeek = :dayOfWeek', {
        dayOfWeek: String(dto.dayOfWeek),
      })
      .andWhere('schedule.start_slot < :end_slot', { end_slot: dto.end_slot })
      .andWhere('schedule.end_slot > :start_slot', {
        start_slot: dto.start_slot,
      })
      .andWhere('course.teacher_id = :teacherId', {
        teacherId: currentCourse.teacher_id,
      })
      .getOne();

    return conflict;
  }

  async create(createScheduleDto: CreateScheduleDto) {
    // Kiểm tra classroom không trùng lịch
    const classroomConflict =
      await this.checkClassroomConflict(createScheduleDto);

    if (classroomConflict) {
      throw new BadRequestException(
        `Classroom ${createScheduleDto.room_id} already has schedule at this time`,
      );
    }

    // Kiểm tra teacher hôm đó có lịch học không
    const teacherConflict = await this.checkTeacherConflict(createScheduleDto);
    if (teacherConflict) {
      throw new BadRequestException(
        `Teacher already has schedule on ${createScheduleDto.dayOfWeek} at this time`,
      );
    }

    return await this.scheduleRepository.save(createScheduleDto);
  }

  findAll() {
    return this.scheduleRepository.find({ relations: ['course', 'room'] });
  }

  findOne(id: number) {
    return this.scheduleRepository.findOne({
      where: { id },
      relations: ['course', 'room'],
    });
  }

  update(id: number, updateScheduleDto: UpdateScheduleDto) {
    return `This action updates a #${id} schedule`;
  }

  remove(id: number) {
    return this.scheduleRepository.delete(id);
  }
}
