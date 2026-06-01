import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CoursesService } from '../courses/courses.service';
import { ClassroomsService } from '../classrooms/classrooms.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseService: CoursesService,
    private readonly classroomService: ClassroomsService,
  ) {}

  private async checkClassroomConflict(
    dto: CreateScheduleDto | UpdateScheduleDto,
  ) {
    const where: any = {
      classroom_id: dto.classroom_id,
      dayOfWeek: String(dto.dayOfWeek),
      start_slot: { lte: dto.end_slot },
      end_slot: { gte: dto.start_slot },
    };

    if (dto.start_date && dto.end_date) {
      where.start_date = { lte: new Date(dto.end_date) };
      where.end_date = { gte: new Date(dto.start_date) };
    }

    return this.prisma.schedule.findFirst({ where });
  }

  private async checkTeacherConflict(
    dto: CreateScheduleDto | UpdateScheduleDto,
  ) {
    const currentCourse = await this.courseService.findOneByCourseID(
      dto.course_id,
    );

    if (!currentCourse) return null;

    const where: any = {
      dayOfWeek: String(dto.dayOfWeek),
      start_slot: { lte: dto.end_slot },
      end_slot: { gte: dto.start_slot },
      course: {
        teacher_id: currentCourse.teacher_id,
      },
    };

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
        start_slot: createScheduleDto.start_slot,
        end_slot: createScheduleDto.end_slot,
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

  findScheduleWithCourseID(courseID: string) {
    return this.prisma.schedule.findFirst({
      where: { course_id: courseID },
    });
  }

  findOne(id: string) {
    return this.prisma.schedule.findMany({ where: { schedule_id: id } });
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

    if (course.capacity && classroom.capacity < course.capacity) {
      throw new BadRequestException(
        `Classroom capacity (${classroom.capacity}) is less than course maximum students (${course.capacity}). Please choose a larger classroom.`,
      );
    }

    const classroomConflict =
      await this.checkClassroomConflict(updateScheduleDto);

    if (classroomConflict) {
      throw new BadRequestException(
        `Classroom ${updateScheduleDto.classroom_id} already has schedule at this time`,
      );
    }

    const teacherConflict = await this.checkTeacherConflict(updateScheduleDto);
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
