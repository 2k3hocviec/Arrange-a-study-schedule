import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemestersService {
  constructor(private readonly prisma: PrismaService) {}

  private startOfDay(date: Date) {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  }

  private normalizeDates(dto: CreateSemesterDto | UpdateSemesterDto) {
    const startDate = dto.start_date ? new Date(dto.start_date) : undefined;
    const endDate = dto.end_date ? new Date(dto.end_date) : undefined;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'Semester start_date must be before end_date',
      );
    }

    return { startDate, endDate };
  }

  private resolveRegisterStatus(isActive: boolean, isRegister?: boolean) {
    if (!isActive) {
      if (isRegister) {
        throw new BadRequestException(
          'Registration can only be opened for the active semester',
        );
      }

      return false;
    }

    return Boolean(isRegister);
  }

  private async ensureSchedulesWithinSemesterDateRange(
    semesterId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    if (!startDate || !endDate) {
      return;
    }

    const scheduleOutOfRange = await this.prisma.schedule.findFirst({
      where: {
        course: { semester_id: semesterId },
        OR: [
          { start_date: null },
          { end_date: null },
          { start_date: { lt: this.startOfDay(startDate) } },
          { end_date: { gt: this.startOfDay(endDate) } },
        ],
      },
      include: {
        course: {
          select: {
            course_code: true,
          },
        },
      },
    });

    if (scheduleOutOfRange) {
      throw new BadRequestException(
        `Cannot update semester date range because schedule ${scheduleOutOfRange.schedule_id} is outside the new semester date range`,
      );
    }
  }

  async create(createSemesterDto: CreateSemesterDto) {
    const { startDate, endDate } = this.normalizeDates(createSemesterDto);

    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Semester start_date and end_date are required',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (createSemesterDto.is_active) {
        await tx.semester.updateMany({
          data: { is_active: false, is_register: false },
        });
      }

      const isActive = Boolean(createSemesterDto.is_active);

      return tx.semester.create({
        data: {
          name: createSemesterDto.name,
          school_year: createSemesterDto.school_year,
          start_date: startDate,
          end_date: endDate,
          is_active: isActive,
          is_register: this.resolveRegisterStatus(
            isActive,
            createSemesterDto.is_register,
          ),
        },
      });
    });
  }

  findAll() {
    return this.prisma.semester.findMany({
      orderBy: [{ school_year: 'desc' }, { start_date: 'desc' }],
    });
  }

  findActive() {
    return this.prisma.semester.findFirst({ where: { is_active: true } });
  }

  findOne(id: string) {
    return this.prisma.semester.findUnique({ where: { semester_id: id } });
  }

  async update(id: string, updateSemesterDto: UpdateSemesterDto) {
    const semester = await this.findOne(id);
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    const { startDate, endDate } = this.normalizeDates({
      ...semester,
      ...updateSemesterDto,
    } as UpdateSemesterDto);

    await this.ensureSchedulesWithinSemesterDateRange(id, startDate, endDate);

    return this.prisma.$transaction(async (tx) => {
      if (updateSemesterDto.is_active) {
        await tx.semester.updateMany({
          where: { semester_id: { not: id } },
          data: { is_active: false, is_register: false },
        });
      }

      const nextIsActive =
        updateSemesterDto.is_active === undefined
          ? semester.is_active
          : updateSemesterDto.is_active;
      const requestedRegister =
        updateSemesterDto.is_register === undefined
          ? semester.is_register
          : updateSemesterDto.is_register;

      if (updateSemesterDto.is_register && !nextIsActive) {
        throw new BadRequestException(
          'Registration can only be opened for the active semester',
        );
      }

      const nextIsRegister = nextIsActive ? requestedRegister : false;

      return tx.semester.update({
        where: { semester_id: id },
        data: {
          name: updateSemesterDto.name,
          school_year: updateSemesterDto.school_year,
          start_date: startDate,
          end_date: endDate,
          is_active: updateSemesterDto.is_active,
          is_register: this.resolveRegisterStatus(nextIsActive, nextIsRegister),
        },
      });
    });
  }

  async activate(id: string) {
    const semester = await this.findOne(id);
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.semester.updateMany({
        data: { is_active: false, is_register: false },
      });
      return tx.semester.update({
        where: { semester_id: id },
        data: { is_active: true },
      });
    });
  }

  async setRegisterStatus(id: string, isRegister: boolean) {
    const semester = await this.findOne(id);
    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    if (isRegister && !semester.is_active) {
      throw new BadRequestException(
        'Registration can only be opened for the active semester',
      );
    }

    return this.prisma.semester.update({
      where: { semester_id: id },
      data: { is_register: Boolean(isRegister) },
    });
  }

  async remove(id: string) {
    const courseCount = await this.prisma.course.count({
      where: { semester_id: id },
    });

    if (courseCount > 0) {
      throw new BadRequestException('Cannot delete semester that has courses');
    }

    return this.prisma.semester.delete({ where: { semester_id: id } });
  }
}
