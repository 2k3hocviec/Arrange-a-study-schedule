import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  private hasScheduledClassroomProtectedChanges(
    classroom: { capacity: number; type: string; status: string },
    updateClassroomsDto: UpdateClassroomDto,
  ) {
    if (
      updateClassroomsDto.capacity !== undefined &&
      Number(updateClassroomsDto.capacity) !== classroom.capacity
    ) {
      return true;
    }

    if (
      updateClassroomsDto.type !== undefined &&
      updateClassroomsDto.type !== classroom.type
    ) {
      return true;
    }

    if (
      updateClassroomsDto.status !== undefined &&
      updateClassroomsDto.status !== classroom.status
    ) {
      return true;
    }

    return false;
  }

  /*
    Tạo lớp học
      - Điều kiện là mã lớp phải không tồn tại.
      - Số lượng sinh viên phải lớn hơn 0.
  */
  async create(createClassroomDto: CreateClassroomDto) {
    const classroom = await this.findOne(createClassroomDto.classroom_id);

    if (classroom) {
      throw new BadRequestException('Classroom already exists');
    }

    if (createClassroomDto.capacity <= 0) {
      throw new BadRequestException(
        'The number of students must be greater than zero.',
      );
    }

    return this.prisma.classroom.create({ data: createClassroomDto });
  }

  async findAll() {
    return this.prisma.classroom.findMany();
  }

  async findOne(classroomId: string) {
    return this.prisma.classroom.findUnique({
      where: { classroom_id: classroomId },
    });
  }

  /*
  Update phải kiểm tra:
    - Phòng học có đang được xếp lịch không, nếu có thì block không cho thay đổi làm sai thuộc tính loại phòng và số lượng.
  */
  async update(id: string, updateclassroomsDto: UpdateClassroomDto) {
    const classroom = await this.findOne(id);

    if (!classroom) {
      throw new NotFoundException('classrooms not found');
    }

    const scheduleCount = await this.prisma.schedule.count({
      where: { classroom_id: id },
    });

    if (
      scheduleCount > 0 &&
      this.hasScheduledClassroomProtectedChanges(classroom, updateclassroomsDto)
    ) {
      throw new BadRequestException(
        'Cannot update classroom that has schedule',
      );
    }

    return this.prisma.classroom.update({
      where: { classroom_id: id },
      data: updateclassroomsDto,
    });
  }

  async remove(id: string) {
    const classroom = await this.findOne(id);
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const scheduleCount = await this.prisma.schedule.count({
      where: { classroom_id: id },
    });

    if (scheduleCount > 0) {
      throw new BadRequestException(
        'Cannot delete classroom that has schedules',
      );
    }

    await this.prisma.classroom.delete({ where: { classroom_id: id } });
    return classroom;
  }
}
