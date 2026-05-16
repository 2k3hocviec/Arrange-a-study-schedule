import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './entities/classroom.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom)
    private readonly classroomsRepository: Repository<Classroom>,
  ) {}
  async create(createClassroomDto: CreateClassroomDto) {
    // Kiểm tra classrooms tồn tại chưa
    const classroom = await this.classroomsRepository.findOneBy({
      classroom_id: createClassroomDto.classroom_id,
    });

    if (classroom) {
      throw new BadRequestException('Classroom already exists');
    }

    const newClassroom =
      await this.classroomsRepository.save(createClassroomDto);
    return newClassroom;
  }

  async findAll() {
    return await this.classroomsRepository.find();
  }

  async findOne(classroomId: string) {
    return await this.classroomsRepository.findOneBy({
      classroom_id: classroomId,
    });
  }

  async update(id: string, updateclassroomsDto: UpdateClassroomDto) {
    const classrooms = await this.classroomsRepository.findOneBy({
      classroom_id: id,
    });

    if (!classrooms) {
      throw new NotFoundException('classrooms not found');
    }
    return this.classroomsRepository.update(
      { classroom_id: id },
      updateclassroomsDto,
    );
  }

  async remove(id: string) {
    const teacher = await this.classroomsRepository.findOneBy({
      classroom_id: id,
    });
    if (!teacher) {
      throw new NotFoundException('Classroom not found');
    }

    await this.classroomsRepository.delete({ classroom_id: id });
    return teacher;
  }
}
