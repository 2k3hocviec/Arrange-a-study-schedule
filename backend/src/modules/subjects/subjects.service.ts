import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MajorsService } from '../majors/majors.service';

@Injectable()
export class SubjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly majorsService: MajorsService,
  ) { }

  async create(createSubjectDto: CreateSubjectDto) {
    const subjectOld = await this.findOne(createSubjectDto.subject_id);

    if (subjectOld) {
      throw new BadRequestException('Subject_ID already exists');
    }

    await this.majorsService.ensureExists(createSubjectDto.major_id);

    return this.prisma.subject.create({ data: createSubjectDto });
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: {
        major: { include: { department: true } },
        _count: { select: { course: true } },
      },
      orderBy: { subject_id: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { subject_id: id },
      include: {
        major: { include: { department: true } },
        _count: { select: { course: true } },
      },
    });
  }

  /* 
  câp nhật thông tin môn học:
    - kiểm tra xem môn học có tồn tại hay không
    - nếu chuyển ngành thì phải kiểm tra xem môn học đó có lớp học nào không nếu có thì không được chuyển ngành. 
    - cập nhật số lượng tín chỉ nếu môn học có lớp học thì không được cập nhật số lượng tín chỉ.
    - cập nhật quyền đăng ký nếu môn học có lớp học thì không được cập nhật quyền đăng ký.
  */
  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subjectOld = await this.findOne(id);

    if (!subjectOld) {
      throw new BadRequestException('Subject does not exists');
    }

    if (updateSubjectDto.major_id) {
      await this.majorsService.ensureExists(updateSubjectDto.major_id);
    }

    const isChangingAllowSameMajor =
      updateSubjectDto.allow_same_major !== undefined &&
      updateSubjectDto.allow_same_major !== subjectOld.allow_same_major;
    const isChangingAllowSameDepartment =
      updateSubjectDto.allow_same_department !== undefined &&
      updateSubjectDto.allow_same_department !==
      subjectOld.allow_same_department;
    const isChangingMajor =
      updateSubjectDto.major_id !== undefined &&
      updateSubjectDto.major_id !== subjectOld.major_id;
    const isChangingCredits =
      updateSubjectDto.credits !== undefined &&
      updateSubjectDto.credits !== subjectOld.credits;

    if (
      subjectOld._count.course > 0 &&
      (isChangingAllowSameMajor || isChangingAllowSameDepartment || isChangingMajor || isChangingCredits)
    ) {
      throw new BadRequestException(
        'Cannot change subject registration flags, credits or major when subject has courses',
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
        major_id: true,
        allow_same_major: true,
        allow_same_department: true,
        major: {
          select: {
            major_id: true,
            name: true,
            department_id: true,
          },
        },
      },
    });
  }
}
