import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CoursesService } from '../courses/courses.service';
import { ClassroomsService } from '../classrooms/classrooms.service';
import { PrismaService } from 'src/prisma/prisma.service';

const READY_CLASSROOM_STATUS = 'Ready';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
    private readonly classroomService: ClassroomsService,
  ) {}

  private ensureRoomTypeMatches(
    course: { required_room_type: string },
    classroom: { type: string },
  ) {
    if (course.required_room_type !== classroom.type) {
      throw new BadRequestException(
        `Classroom type ${classroom.type} does not match required room type ${course.required_room_type}`,
      );
    }
  }

  private normalizeSlots(dto: CreateScheduleDto | UpdateScheduleDto) {
    return {
      start_slot: Number(dto.start_slot),
      end_slot: Number(dto.end_slot),
    };
  }

  private async checkClassroomConflict(
    dto: CreateScheduleDto | UpdateScheduleDto,
    excludeScheduleId?: string,
  ) {
    const { start_slot, end_slot } = this.normalizeSlots(dto);
    const where: any = {
      classroom_id: dto.classroom_id,
      dayOfWeek: String(dto.dayOfWeek),
      start_slot: { lte: end_slot },
      end_slot: { gte: start_slot },
    };

    // Khi update schedule có thể tự báo trùng với chính nó, vì vậy ta cần loại trừ cái hiện tại
    if (excludeScheduleId) {
      where.schedule_id = { not: excludeScheduleId };
    }

    if (dto.start_date && dto.end_date) {
      where.start_date = { lte: new Date(dto.end_date) };
      where.end_date = { gte: new Date(dto.start_date) };
    }

    return this.prisma.schedule.findFirst({ where });
  }

  private async checkTeacherConflict(
    dto: CreateScheduleDto | UpdateScheduleDto,
    excludeScheduleId?: string,
  ) {
    const currentCourse = await this.courseService.findOneByCourseID(
      dto.course_id,
    );

    if (!currentCourse) return null;

    const { start_slot, end_slot } = this.normalizeSlots(dto);
    const where: any = {
      dayOfWeek: String(dto.dayOfWeek),
      start_slot: { lte: end_slot },
      end_slot: { gte: start_slot },
      course: {
        teacher_id: currentCourse.teacher_id,
      },
    };

    if (excludeScheduleId) {
      where.schedule_id = { not: excludeScheduleId };
    }

    if (dto.start_date && dto.end_date) {
      where.start_date = { lte: new Date(dto.end_date) };
      where.end_date = { gte: new Date(dto.start_date) };
    }

    return this.prisma.schedule.findFirst({
      where,
      include: { course: true },
    });
  }

  async create(createScheduleDto: CreateScheduleDto) {
    const { start_slot, end_slot } = this.normalizeSlots(createScheduleDto);
    const classroom = await this.classroomService.findOne(
      createScheduleDto.classroom_id,
    );

    if (!classroom) {
      throw new BadRequestException(`Classroom not exist`);
    }

    if (classroom.status !== READY_CLASSROOM_STATUS) {
      throw new BadRequestException(
        `Classroom ${createScheduleDto.classroom_id} is not ready for scheduling`,
      );
    }

    const course = await this.courseService.findOne(
      createScheduleDto.course_id,
    );

    if (!course) {
      throw new BadRequestException(`Course not exist`);
    }

    this.ensureRoomTypeMatches(course, classroom);

    if (course.capacity && classroom.capacity < course.capacity) {
      throw new BadRequestException(
        `Classroom capacity (${classroom.capacity}) is less than course maximum students (${course.capacity}). Please choose a larger classroom.`,
      );
    }

    const classroomConflict =
      await this.checkClassroomConflict(createScheduleDto);

    if (classroomConflict) {
      throw new BadRequestException(
        `Classroom ${createScheduleDto.classroom_id} already has schedule at this time`,
      );
    }

    const teacherConflict = await this.checkTeacherConflict(createScheduleDto);
    if (teacherConflict) {
      throw new BadRequestException(
        `Teacher already has schedule on ${createScheduleDto.dayOfWeek} at this time`,
      );
    }

    return this.prisma.schedule.create({
      data: {
        course_id: createScheduleDto.course_id,
        classroom_id: createScheduleDto.classroom_id,
        dayOfWeek: String(createScheduleDto.dayOfWeek),
        start_slot,
        end_slot,
        start_date: createScheduleDto.start_date
          ? new Date(createScheduleDto.start_date)
          : null,
        end_date: createScheduleDto.end_date
          ? new Date(createScheduleDto.end_date)
          : null,
      },
    });
  }

  async findExistingSchedules(courseIDs: string[]) {
    return this.prisma.schedule.findMany({
      where: { course_id: { in: courseIDs } },
    });
  }

  findAll() {
    return this.prisma.schedule.findMany({ include: { course: true, room: true } });
  }

  findOneWithRoom(schedule_id: string) {
    return this.prisma.schedule.findUnique({
      where: { schedule_id },
      include: { course: true, room: true },
    });
  }

  findSchedulesWithCourseID(courseID: string) {
    return this.prisma.schedule.findMany({
      where: { course_id: courseID },
    });
  }

  findOne(id: string) {
    return this.prisma.schedule.findMany({ where: { schedule_id: id } });
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const { start_slot, end_slot } = this.normalizeSlots(updateScheduleDto);
    const classroom = await this.classroomService.findOne(
      updateScheduleDto.classroom_id,
    );

    if (!classroom) {
      throw new BadRequestException(`Classroom not exist`);
    }

    if (classroom.status !== READY_CLASSROOM_STATUS) {
      throw new BadRequestException(
        `Classroom ${updateScheduleDto.classroom_id} is not ready for scheduling`,
      );
    }

    const course = await this.courseService.findOne(
      updateScheduleDto.course_id,
    );

    if (!course) {
      throw new BadRequestException(`Course not exist`);
    }

    this.ensureRoomTypeMatches(course, classroom);

    if (course.capacity && classroom.capacity < course.capacity) {
      throw new BadRequestException(
        `Classroom capacity (${classroom.capacity}) is less than course maximum students (${course.capacity}). Please choose a larger classroom.`,
      );
    }

    const classroomConflict = await this.checkClassroomConflict(
      updateScheduleDto,
      id,
    );

    if (classroomConflict) {
      throw new BadRequestException(
        `Classroom ${updateScheduleDto.classroom_id} already has schedule at this time`,
      );
    }

    const teacherConflict = await this.checkTeacherConflict(
      updateScheduleDto,
      id,
    );
    if (teacherConflict) {
      throw new BadRequestException(
        `Teacher already has schedule on ${updateScheduleDto.dayOfWeek} at this time`,
      );
    }

    return this.prisma.schedule.update({
      where: { schedule_id: id },
      data: {
        ...updateScheduleDto,
        dayOfWeek:
          updateScheduleDto.dayOfWeek === undefined
            ? undefined
            : String(updateScheduleDto.dayOfWeek),
        start_slot,
        end_slot,
        start_date: updateScheduleDto.start_date
          ? new Date(updateScheduleDto.start_date)
          : undefined,
        end_date: updateScheduleDto.end_date
          ? new Date(updateScheduleDto.end_date)
          : undefined,
      },
    });
  }

  remove(id: string) {
    return this.prisma.schedule.delete({ where: { schedule_id: id } });
  }
}
