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
      id: createClassroomDto.id,
    });
    if (classroom) {
      throw new BadRequestException('Classroom already exists');
    }

    const newClassroom =
      await this.classroomsRepository.save(createClassroomDto);
    console.log('New Classroom:', newClassroom);
    console.log('Capacity:', newClassroom.capacity);
    return newClassroom;
  }

  async findAll() {
    return await this.classroomsRepository.find();
  }

  async findOne(id: string) {
    return `This action returns a #${id} classroom`;
  }

  async update(id: string, updateclassroomsDto: UpdateClassroomDto) {
    const classrooms = await this.classroomsRepository.findOneBy({
      id: id,
    });

    if (!classrooms) {
      throw new NotFoundException('classrooms not found');
    }
    return this.classroomsRepository.update({ id: id }, updateclassroomsDto);
  }

  async remove(id: string) {
    const teacher = await this.classroomsRepository.findOneBy({ id: id });
    if (!teacher) {
      throw new NotFoundException('Classroom not found');
    }

    await this.classroomsRepository.delete({ id: id });
    return teacher;
  }
}
