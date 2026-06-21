import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DepartmentsService } from '../departments/departments.service';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const subjectOld = await this.findOne(createSubjectDto.subject_id);

    if (subjectOld) {
      throw new BadRequestException('Subject_ID already exists');
    }

    await this.departmentsService.ensureExists(createSubjectDto.department_id);

    return this.prisma.subject.create({ data: createSubjectDto });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: { department: true },
      orderBy: { subject_id: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { subject_id: id },
      include: { department: true },
    });
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subjectOld = await this.findOne(id);

    if (!subjectOld) {
      throw new BadRequestException('Subject does not exists');
    }

    if (updateSubjectDto.department_id) {
      await this.departmentsService.ensureExists(
        updateSubjectDto.department_id,
      );
    }

    return this.prisma.subject.update({
      where: { subject_id: id },
      data: updateSubjectDto,
    });
  }

  async remove(id: string) {
    const courseCount = await this.prisma.course.count({
      where: { subject_id: id },
    });

    if (courseCount > 0) {
      throw new BadRequestException('Cannot delete subject that has courses');
    }

    return this.prisma.subject.delete({ where: { subject_id: id } });
  }

  async findAllId() {
    return this.prisma.subject.findMany({
      select: {
        subject_id: true,
        name: true,
        department_id: true,
        is_general: true,
      },
    });
  }
}
