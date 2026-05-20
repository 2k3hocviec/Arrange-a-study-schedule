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

  private async checkClassroomConflict(
    dto: CreateScheduleDto | UpdateScheduleDto,
  ) {
    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.classroom_id = :roomId', { roomId: dto.classroom_id })
      .andWhere('schedule.dayOfWeek = :day', { day: String(dto.dayOfWeek) })
      .andWhere('schedule.start_slot <= :endNew', { endNew: dto.end_slot })
      .andWhere('schedule.end_slot >= :startNew', { startNew: dto.start_slot });

    // Kiểm tra khoảng ngày: chỉ conflict nếu:
    // - Schedule cũ không có ngày (NULL) hoặc
    // - Khoảng ngày của schedule mới overlap với schedule cũ
    if (dto.start_date && dto.end_date) {
      const startDate = new Date(dto.start_date);
      const endDate = new Date(dto.end_date);
      query
        .andWhere(`schedule.start_date <= :endDate`, {
          endDate,
        })
        .andWhere(`schedule.end_date >= :startDate`, {
          startDate,
        });
    }

    return await query.getOne();
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
    // Thêm kiểm tra khoảng ngày: chỉ xung đột nếu ngày overlap hoặc schedule cũ không có giới hạn ngày
    const query = this.scheduleRepository
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
      });

    // Kiểm tra khoảng ngày: chỉ conflict nếu:
    // - Schedule cũ không có ngày (NULL) hoặc
    // - Khoảng ngày của schedule mới overlap với schedule cũ
    if (dto.start_date && dto.end_date) {
      const startDate = new Date(dto.start_date);
      const endDate = new Date(dto.end_date);

      query
        .andWhere(`schedule.start_date <= :endDate`, {
          endDate,
        })
        .andWhere(`schedule.end_date >= :startDate`, {
          startDate,
        });
    }

    const conflict = await query.getOne();
    return conflict;
  }

  async create(createScheduleDto: CreateScheduleDto) {
    const classroom = await this.classroomService.findOne(
      createScheduleDto.classroom_id,
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

    // Kiểm tra sức chứa của lớp có đủ cho số sinh viên tối đa của khóa học không
    if (course.capacity && classroom.capacity < course.capacity) {
      throw new BadRequestException(
        `Classroom capacity (${classroom.capacity}) is less than course maximum students (${course.capacity}). Please choose a larger classroom.`,
      );
    }

    // Kiểm tra classroom không trùng lịch
    const classroomConflict =
      await this.checkClassroomConflict(createScheduleDto);

    if (classroomConflict) {
      throw new BadRequestException(
        `Classroom ${createScheduleDto.classroom_id} already has schedule at this time`,
      );
    }

    // Kiểm tra teacher hôm đó có lịch học không
    const teacherConflict = await this.checkTeacherConflict(createScheduleDto);
    if (teacherConflict) {
      throw new BadRequestException(
        `Teacher already has schedule on ${createScheduleDto.dayOfWeek} at this time`,
      );
    }

    const schedule = new Schedule();
    schedule.course_id = createScheduleDto.course_id;
    schedule.classroom_id = createScheduleDto.classroom_id;
    schedule.dayOfWeek = createScheduleDto.dayOfWeek;
    schedule.start_slot = createScheduleDto.start_slot;
    schedule.end_slot = createScheduleDto.end_slot;
    schedule.start_date = createScheduleDto.start_date
      ? new Date(createScheduleDto.start_date)
      : null;
    schedule.end_date = createScheduleDto.end_date
      ? new Date(createScheduleDto.end_date)
      : null;
    return await this.scheduleRepository.save(schedule);
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
      updateScheduleDto.classroom_id,
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

    // Kiểm tra sức chứa của lớp có đủ cho số sinh viên tối đa của khóa học không
    if (course.capacity && classroom.capacity < course.capacity) {
      throw new BadRequestException(
        `Classroom capacity (${classroom.capacity}) is less than course maximum students (${course.capacity}). Please choose a larger classroom.`,
      );
    }

    // Kiểm tra classroom không trùng lịch
    const classroomConflict =
      await this.checkClassroomConflict(updateScheduleDto);

    if (classroomConflict) {
      throw new BadRequestException(
        `Classroom ${updateScheduleDto.classroom_id} already has schedule at this time`,
      );
    }

    // Kiểm tra teacher hôm đó có lịch học không
    const teacherConflict = await this.checkTeacherConflict(updateScheduleDto);
    if (teacherConflict) {
      throw new BadRequestException(
        `Teacher already has schedule on ${updateScheduleDto.dayOfWeek} at this time`,
      );
    }

    // Chuyển đổi ngày nếu có
    const dataToUpdate = {
      ...updateScheduleDto,
      start_date: updateScheduleDto.start_date
        ? new Date(updateScheduleDto.start_date)
        : undefined,
      end_date: updateScheduleDto.end_date
        ? new Date(updateScheduleDto.end_date)
        : undefined,
    };

    return await this.scheduleRepository.update(id, dataToUpdate);
  }

  remove(id: string) {
    return this.scheduleRepository.delete(id);
  }
}
