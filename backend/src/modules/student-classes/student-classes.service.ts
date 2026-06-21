import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStudentClassDto } from './dto/create-student-class.dto';
import { UpdateStudentClassDto } from './dto/update-student-class.dto';
import { MajorsService } from '../majors/majors.service';

@Injectable()
export class StudentClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly majorsService: MajorsService,
  ) {}

  private normalizeCapacity(capacity?: number | string | null) {
    if (capacity === undefined || capacity === null || capacity === '') {
      return null;
    }

    const normalized = Number(capacity);
    if (!Number.isInteger(normalized) || normalized <= 0) {
      throw new BadRequestException('Class capacity must be a positive number');
    }

    return normalized;
  }

  async create(createStudentClassDto: CreateStudentClassDto) {
    const existingClass = await this.findOne(createStudentClassDto.class_id);
    if (existingClass) {
      throw new BadRequestException('Student class already exists');
    }

    await this.majorsService.ensureExists(createStudentClassDto.major_id);

    return this.prisma.studentClass.create({
      data: {
        ...createStudentClassDto,
        capacity: this.normalizeCapacity(createStudentClassDto.capacity),
      },
    });
  }

  findAll() {
    return this.prisma.studentClass.findMany({
      include: {
        major: { include: { department: true } },
        _count: { select: { students: true } },
      },
      orderBy: { class_id: 'asc' },
    });
  }

  findOne(classId: string) {
    return this.prisma.studentClass.findUnique({
      where: { class_id: classId },
      include: {
        major: { include: { department: true } },
        _count: { select: { students: true } },
      },
    });
  }

  async update(id: string, updateStudentClassDto: UpdateStudentClassDto) {
    const studentClass = await this.findOne(id);
    if (!studentClass) {
      throw new NotFoundException('Student class not found');
    }

    if (updateStudentClassDto.major_id) {
      await this.majorsService.ensureExists(updateStudentClassDto.major_id);
    }

    const capacity =
      updateStudentClassDto.capacity === undefined
        ? undefined
        : this.normalizeCapacity(updateStudentClassDto.capacity);

    if (
      capacity !== undefined &&
      capacity !== null &&
      studentClass._count.students > capacity
    ) {
      throw new BadRequestException(
        `Cannot update capacity to ${capacity}. This class already has ${studentClass._count.students} students`,
      );
    }

    return this.prisma.studentClass.update({
      where: { class_id: id },
      data: {
        name: updateStudentClassDto.name,
        cohort: updateStudentClassDto.cohort,
        major_id: updateStudentClassDto.major_id,
        capacity,
      },
    });
  }

  async remove(id: string) {
    const studentClass = await this.findOne(id);
    if (!studentClass) {
      throw new NotFoundException('Student class not found');
    }

    if (studentClass._count.students > 0) {
      throw new BadRequestException('Cannot delete class that has students');
    }

    await this.prisma.studentClass.delete({ where: { class_id: id } });
    return studentClass;
  }
}
