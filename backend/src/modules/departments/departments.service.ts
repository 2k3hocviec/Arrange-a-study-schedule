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

  private async withStudentClassesCount<
    T extends { department_id: string },
  >(department: T) {
    const majors = await this.prisma.major.findMany({
      where: { department_id: department.department_id },
      select: { _count: { select: { studentClasses: true } } },
    });

    return {
      ...department,
      studentClassesCount: majors.reduce(
        (total, major) => total + major._count.studentClasses,
        0,
      ),
    };
  }

  private async withDepartmentsStudentClassesCount<
    T extends { department_id: string },
  >(departments: T[]) {
    return Promise.all(
      departments.map((department) =>
        this.withStudentClassesCount(department),
      ),
    );
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    const existingDepartment = await this.findOne(
      createDepartmentDto.department_id,
    );
    if (existingDepartment) {
      throw new BadRequestException('Department already exists');
    }

    return this.prisma.department.create({ data: createDepartmentDto });
  }

  async findAll() {
    const departments = await this.prisma.department.findMany({
      include: {
        _count: {
          select: {
            teachers: true,
            majors: true,
          },
        },
      },
      orderBy: { department_id: 'asc' },
    });

    return this.withDepartmentsStudentClassesCount(departments);
  }

  async findOne(departmentId: string) {
    const department = await this.prisma.department.findUnique({
      where: { department_id: departmentId },
      include: {
        _count: {
          select: {
            teachers: true,
            majors: true,
          },
        },
      },
    });

    return department ? this.withStudentClassesCount(department) : null;
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
      department._count.teachers > 0 ||
      department._count.majors > 0;

    if (hasRelations) {
      throw new BadRequestException('Cannot delete department that is in use');
    }

    await this.prisma.department.delete({ where: { department_id: id } });
    return department;
  }
}
