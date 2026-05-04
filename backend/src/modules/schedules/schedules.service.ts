import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CoursesService } from '../courses/courses.service';
import { ClassroomsService } from '../classrooms/classrooms.service';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly courseService: CoursesService,
    private readonly classroomService: ClassroomsService,
  ) {}

  private async checkClassroomConflict(dto: CreateScheduleDto) {
    return await this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.room_id = :roomId', { roomId: dto.room_id })
      .andWhere('schedule.dayOfWeek = :day', { day: String(dto.dayOfWeek) })
      .andWhere('schedule.start_slot <= :endNew', { endNew: dto.end_slot })
      .andWhere('schedule.end_slot >= :startNew', { startNew: dto.start_slot })
      .getOne();
  }

  private async checkTeacherConflict(
    dto: CreateScheduleDto | UpdateScheduleDto,
  ) {
    // 1. Tìm thông tin khóa học hiện tại để biết giáo viên là ai
    const currentCourse = await this.courseService.findOneByCourseID(
      dto.course_id,
    );

    if (!currentCourse) return null;

    // 2. Tìm bất kỳ lịch dạy nào của giáo viên này bị trùng giờ
    // Sử dụng QueryBuilder để join sang bảng Course và check teacher_id
    const conflict = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.course', 'course')
      .where('schedule.dayOfWeek = :dayOfWeek', {
        dayOfWeek: String(dto.dayOfWeek),
      })
      .andWhere('schedule.start_slot <= :end_slot', { end_slot: dto.end_slot })
      .andWhere('schedule.end_slot >= :start_slot', {
        start_slot: dto.start_slot,
      })
      .andWhere('course.teacher_id = :teacherId', {
        teacherId: currentCourse.teacher_id,
      })
      .getOne();

    return conflict;
  }

  async create(createScheduleDto: CreateScheduleDto) {
    const classroom = await this.classroomService.findOne(
      createScheduleDto.room_id,
    );

    if (!classroom) {
      throw new BadRequestException(`Classroom not exist`);
    }

    const course = await this.courseService.findOne(
      createScheduleDto.course_id,
    );

    if (!course) {
      throw new BadRequestException(`Course not exist`);
    }

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

  async findExistingSchedules(courseIDs: string[]) {
    return await this.scheduleRepository.find({
      where: { course_id: In(courseIDs) },
    });
  }

  findAll() {
    return this.scheduleRepository.find({ relations: ['course', 'room'] });
  }

  findOneWithRoom(schedule_id: string) {
    return this.scheduleRepository.findOne({
      where: { schedule_id },
      relations: ['course', 'room'],
    });
  }

  findScheduleWithCourseID(courseID: string) {
    return this.scheduleRepository.findOne({
      where: { course_id: courseID },
    });
  }

  findOne(id: string) {
    return this.scheduleRepository.findBy({ schedule_id: id });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const classroom = await this.classroomService.findOne(
      updateScheduleDto.room_id,
    );

    if (!classroom) {
      throw new BadRequestException(`Classroom not exist`);
    }

    const course = await this.courseService.findOne(
      updateScheduleDto.course_id,
    );

    if (!course) {
      throw new BadRequestException(`Course not exist`);
    }

    // Kiểm tra classroom không trùng lịch
    const classroomConflict =
      await this.checkClassroomConflict(updateScheduleDto);

    if (classroomConflict) {
      throw new BadRequestException(
        `Classroom ${updateScheduleDto.room_id} already has schedule at this time`,
      );
    }

    // Kiểm tra teacher hôm đó có lịch học không
    const teacherConflict = await this.checkTeacherConflict(updateScheduleDto);
    if (teacherConflict) {
      throw new BadRequestException(
        `Teacher already has schedule on ${updateScheduleDto.dayOfWeek} at this time`,
      );
    }

    return await this.scheduleRepository.update(id, updateScheduleDto);
  }

  remove(id: string) {
    return this.scheduleRepository.delete(id);
  }
}
