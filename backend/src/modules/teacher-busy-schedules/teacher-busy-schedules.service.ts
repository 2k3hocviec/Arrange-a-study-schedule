import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeachersService } from '../teachers/teachers.service';
import { CreateTeacherBusyScheduleDto } from './dto/create-teacher-busy-schedule.dto';
import { RejectTeacherBusyScheduleDto } from './dto/reject-teacher-busy-schedule.dto';

const BUSY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

const toDateOnly = (value: string | Date) => {
  const raw = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  const parsed = new Date(`${raw}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException('Busy date is invalid');
  }

  return parsed;
};

const toDayOfWeek = (date: Date) => {
  const day = date.getUTCDay();
  return day === 0 ? '8' : String(day + 1);
};

@Injectable()
export class TeacherBusySchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teachersService: TeachersService,
  ) {}

  private normalizeSlots(dto: { start_slot: number; end_slot: number }) {
    const start_slot = Number(dto.start_slot);
    const end_slot = Number(dto.end_slot);

    if (
      !Number.isInteger(start_slot) ||
      !Number.isInteger(end_slot) ||
      start_slot < 1 ||
      end_slot > 10 ||
      start_slot > end_slot
    ) {
      throw new BadRequestException(
        'Busy slots must be valid and start_slot must be less than or equal to end_slot',
      );
    }

    return { start_slot, end_slot };
  }

  private async findTeachingConflict(params: {
    teacherId: string;
    busyDate: Date;
    startSlot: number;
    endSlot: number;
  }) {
    return this.prisma.schedule.findFirst({
      where: {
        dayOfWeek: toDayOfWeek(params.busyDate),
        start_slot: { lte: params.endSlot },
        end_slot: { gte: params.startSlot },
        course: { teacher_id: params.teacherId },
        OR: [
          { start_date: null },
          { end_date: null },
          {
            start_date: { lte: params.busyDate },
            end_date: { gte: params.busyDate },
          },
        ],
      },
      include: { course: { include: { subject: true } } },
    });
  }

  async findMine(userId: number) {
    const teacher = await this.teachersService.findByUserId(userId);

    return this.prisma.teacherBusySchedule.findMany({
      where: { teacher_id: teacher.teacher_id },
      orderBy: [{ busy_date: 'desc' }, { start_slot: 'asc' }],
    });
  }

  async findAll(status?: string) {
    const where =
      status && Object.values(BUSY_STATUS).includes(status as any)
        ? { status }
        : {};

    return this.prisma.teacherBusySchedule.findMany({
      where,
      include: {
        teacher: {
          select: {
            teacher_id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: [{ busy_date: 'desc' }, { start_slot: 'asc' }],
    });
  }

  async createMine(
    userId: number,
    createBusyDto: CreateTeacherBusyScheduleDto,
  ) {
    const teacher = await this.teachersService.findByUserId(userId);
    const busyDate = toDateOnly(createBusyDto.busy_date);
    const { start_slot, end_slot } = this.normalizeSlots(createBusyDto);

    const existingSchedule = await this.findTeachingConflict({
      teacherId: teacher.teacher_id,
      busyDate,
      startSlot: start_slot,
      endSlot: end_slot,
    });

    if (existingSchedule) {
      throw new BadRequestException(
        'Teacher already has a teaching schedule on this date and slot range',
      );
    }

    try {
      return await this.prisma.teacherBusySchedule.create({
        data: {
          teacher_id: teacher.teacher_id,
          busy_date: busyDate,
          start_slot,
          end_slot,
          reason: createBusyDto.reason?.trim() || null,
          status: BUSY_STATUS.PENDING,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Teacher already registered this busy slot range',
        );
      }

      throw error;
    }
  }

  async removeMine(userId: number, busyId: string) {
    const teacher = await this.teachersService.findByUserId(userId);
    const busySchedule = await this.prisma.teacherBusySchedule.findUnique({
      where: { busy_id: busyId },
    });

    if (!busySchedule) {
      throw new NotFoundException('Busy schedule not found');
    }

    if (busySchedule.teacher_id !== teacher.teacher_id) {
      throw new ForbiddenException('You can only delete your own busy request');
    }

    if (busySchedule.status !== BUSY_STATUS.PENDING) {
      throw new BadRequestException('Only pending busy requests can be deleted');
    }

    return this.prisma.teacherBusySchedule.delete({
      where: { busy_id: busyId },
    });
  }

  private async ensurePending(id: string) {
    const busySchedule = await this.prisma.teacherBusySchedule.findUnique({
      where: { busy_id: id },
    });

    if (!busySchedule) {
      throw new NotFoundException('Busy schedule not found');
    }

    if (busySchedule.status !== BUSY_STATUS.PENDING) {
      throw new BadRequestException(
        'Busy request status has already been finalized',
      );
    }

    return busySchedule;
  }

  async approve(id: string, reviewerId: number) {
    const busySchedule = await this.ensurePending(id);
    const existingSchedule = await this.findTeachingConflict({
      teacherId: busySchedule.teacher_id,
      busyDate: busySchedule.busy_date,
      startSlot: busySchedule.start_slot,
      endSlot: busySchedule.end_slot,
    });

    if (existingSchedule) {
      throw new BadRequestException(
        'Cannot approve because teacher already has a teaching schedule on this date and slot range',
      );
    }

    return this.prisma.teacherBusySchedule.update({
      where: { busy_id: id },
      data: {
        status: BUSY_STATUS.APPROVED,
        reviewedBy: reviewerId,
        reject_reason: null,
      },
    });
  }

  async reject(
    id: string,
    reviewerId: number,
    rejectDto: RejectTeacherBusyScheduleDto,
  ) {
    await this.ensurePending(id);

    return this.prisma.teacherBusySchedule.update({
      where: { busy_id: id },
      data: {
        status: BUSY_STATUS.REJECTED,
        reviewedBy: reviewerId,
        reject_reason: rejectDto.reject_reason?.trim() || null,
      },
    });
  }

  async findConflictForSchedule(params: {
    teacherId: string;
    dayOfWeek: string;
    startSlot: number;
    endSlot: number;
    startDate?: Date | null;
    endDate?: Date | null;
  }) {
    if (!params.startDate || !params.endDate) {
      return null;
    }

    const busyDates = await this.prisma.teacherBusySchedule.findMany({
      where: {
        teacher_id: params.teacherId,
        status: BUSY_STATUS.APPROVED,
        start_slot: { lte: params.endSlot },
        end_slot: { gte: params.startSlot },
        busy_date: {
          gte: toDateOnly(params.startDate),
          lte: toDateOnly(params.endDate),
        },
      },
      orderBy: [{ busy_date: 'asc' }, { start_slot: 'asc' }],
    });

    return (
      busyDates.find(
        (busySchedule) =>
          toDayOfWeek(busySchedule.busy_date) === String(params.dayOfWeek),
      ) || null
    );
  }
}
