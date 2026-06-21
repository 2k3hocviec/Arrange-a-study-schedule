import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DepartmentsService } from '../departments/departments.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';

@Injectable()
export class MajorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  async create(createMajorDto: CreateMajorDto) {
    const existingMajor = await this.findOne(createMajorDto.major_id);
    if (existingMajor) {
      throw new BadRequestException('Major already exists');
    }

    await this.departmentsService.ensureExists(createMajorDto.department_id);

    return this.prisma.major.create({ data: createMajorDto });
  }

  findAll() {
    return this.prisma.major.findMany({
      include: {
        department: true,
        _count: { select: { students: true, subjects: true } },
      },
      orderBy: { major_id: 'asc' },
    });
  }

  findOne(majorId: string) {
    return this.prisma.major.findUnique({
      where: { major_id: majorId },
      include: {
        department: true,
        _count: { select: { students: true, subjects: true } },
      },
    });
  }

  async ensureExists(majorId: string) {
    if (!majorId) {
      throw new BadRequestException('Major is required');
    }

    const major = await this.prisma.major.findUnique({
      where: { major_id: majorId },
      select: { major_id: true },
    });

    if (!major) {
      throw new BadRequestException('Major not found');
    }
  }

  async update(id: string, updateMajorDto: UpdateMajorDto) {
    const major = await this.findOne(id);
    if (!major) {
      throw new NotFoundException('Major not found');
    }

    if (updateMajorDto.department_id) {
      await this.departmentsService.ensureExists(updateMajorDto.department_id);
    }

    return this.prisma.major.update({
      where: { major_id: id },
      data: {
        name: updateMajorDto.name,
        department_id: updateMajorDto.department_id,
        description: updateMajorDto.description,
      },
    });
  }

  async remove(id: string) {
    const major = await this.findOne(id);
    if (!major) {
      throw new NotFoundException('Major not found');
    }

    if (major._count.students > 0 || major._count.subjects > 0) {
      throw new BadRequestException('Cannot delete major that is in use');
    }

    await this.prisma.major.delete({ where: { major_id: id } });
    return major;
  }
}
