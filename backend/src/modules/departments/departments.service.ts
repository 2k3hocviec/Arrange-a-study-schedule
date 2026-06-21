import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existingDepartment = await this.findOne(
      createDepartmentDto.department_id,
    );
    if (existingDepartment) {
      throw new BadRequestException('Department already exists');
    }

    return this.prisma.department.create({ data: createDepartmentDto });
  }

  findAll() {
    return this.prisma.department.findMany({
      include: {
        _count: {
          select: {
            studentClasses: true,
            teachers: true,
            subjects: true,
          },
        },
      },
      orderBy: { department_id: 'asc' },
    });
  }

  findOne(departmentId: string) {
    return this.prisma.department.findUnique({
      where: { department_id: departmentId },
      include: {
        _count: {
          select: {
            studentClasses: true,
            teachers: true,
            subjects: true,
          },
        },
      },
    });
  }

  async ensureExists(departmentId: string) {
    if (!departmentId) {
      throw new BadRequestException('Department is required');
    }

    const department = await this.prisma.department.findUnique({
      where: { department_id: departmentId },
      select: { department_id: true },
    });

    if (!department) {
      throw new BadRequestException('Department not found');
    }
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.findOne(id);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.department.update({
      where: { department_id: id },
      data: {
        name: updateDepartmentDto.name,
        description: updateDepartmentDto.description,
      },
    });
  }

  async remove(id: string) {
    const department = await this.findOne(id);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const hasRelations =
      department._count.studentClasses > 0 ||
      department._count.teachers > 0 ||
      department._count.subjects > 0;

    if (hasRelations) {
      throw new BadRequestException('Cannot delete department that is in use');
    }

    await this.prisma.department.delete({ where: { department_id: id } });
    return department;
  }
}
