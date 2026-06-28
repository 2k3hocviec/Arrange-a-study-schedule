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

  private async withStudentsCount<T extends { major_id: string }>(major: T) {
    const studentClasses = await this.prisma.studentClass.findMany({
      where: { major_id: major.major_id },
      select: { _count: { select: { students: true } } },
    });

    return {
      ...major,
      studentsCount: studentClasses.reduce(
        (total, studentClass) => total + studentClass._count.students,
        0,
      ),
    };
  }

  private async withMajorsStudentsCount<T extends { major_id: string }>(
    majors: T[],
  ) {
    return Promise.all(majors.map((major) => this.withStudentsCount(major)));
  }

  async create(createMajorDto: CreateMajorDto) {
    const existingMajor = await this.findOne(createMajorDto.major_id);
    if (existingMajor) {
      throw new BadRequestException('Major already exists');
    }

    await this.departmentsService.ensureExists(createMajorDto.department_id);

    return this.prisma.major.create({ data: createMajorDto });
  }

  async findAll() {
    const majors = await this.prisma.major.findMany({
      include: {
        department: true,
        _count: { select: { studentClasses: true, subjects: true } },
      },
      orderBy: { major_id: 'asc' },
    });

    return this.withMajorsStudentsCount(majors);
  }

  async findOne(majorId: string) {
    const major = await this.prisma.major.findUnique({
      where: { major_id: majorId },
      include: {
        department: true,
        _count: { select: { studentClasses: true, subjects: true } },
      },
    });

    return major ? this.withStudentsCount(major) : null;
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

  /*
  Cập nhật chuyên ngành
    - kiểm tra mã chuyên ngành có tồn tại hay không.
    - nếu chuyển ngành thì phải kiểm tra xem chuyên ngành đó có lớp học sinh nào không nếu có thì không được chuyển ngành.
  */
  async update(id: string, updateMajorDto: UpdateMajorDto) {
    const major = await this.findOne(id);
    if (!major) {
      throw new NotFoundException('Major not found');
    }

    const isChangingDepartment =
      updateMajorDto.department_id &&
      updateMajorDto.department_id !== major.department_id;

    if (isChangingDepartment && major._count.studentClasses > 0) {
      throw new BadRequestException(
        'Cannot change department of major that has student classes',
      );
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

  /*
  Xóa chuyên ngành phải đảm báo:
    - Không còn lớp học thuộc chuyên ngành.
    - Không môn học thuộc chuyên ngành.
  */
  async remove(id: string) {
    const major = await this.findOne(id);
    if (!major) {
      throw new NotFoundException('Major not found');
    }

    if (major._count.studentClasses > 0 || major._count.subjects > 0) {
      throw new BadRequestException('Cannot delete major that is in use');
    }

    await this.prisma.major.delete({ where: { major_id: id } });
    return major;
  }
}
