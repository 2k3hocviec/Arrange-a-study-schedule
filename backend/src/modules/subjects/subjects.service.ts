import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const subjectOld = await this.findOne(createSubjectDto.subject_id);

    if (subjectOld) {
      throw new BadRequestException('Subject_ID already exists');
    }

    return this.prisma.subject.create({ data: createSubjectDto });
  }

  async findAll() {
    return this.prisma.subject.findMany();
  }

  async findOne(id: string) {
    return this.prisma.subject.findUnique({ where: { subject_id: id } });
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subjectOld = await this.findOne(id);

    if (!subjectOld) {
      throw new BadRequestException('Subject does not exists');
    }

    return this.prisma.subject.update({
      where: { subject_id: id },
      data: updateSubjectDto,
    });
  }

  async remove(id: string) {
    return this.prisma.subject.delete({ where: { subject_id: id } });
  }

  async findAllId() {
    return this.prisma.subject.findMany({
      select: { subject_id: true },
    });
  }
}
