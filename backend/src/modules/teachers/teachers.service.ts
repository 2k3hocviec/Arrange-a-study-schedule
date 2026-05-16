import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from './entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
    private readonly userService: UsersService,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    // Kiểm tra user tồn tại không
    const user = await this.userService.findOne(createTeacherDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra teacher tồn tại chưa
    const teacher = await this.teachersRepository.findOneBy({
      teacher_id: createTeacherDto.teacher_id,
    });
    if (teacher) {
      throw new BadRequestException('Teacher already exists');
    }

    if (user.role !== 'teacher') {
      throw new BadRequestException('This Objects does not teacher');
    }

    return await this.teachersRepository.save(createTeacherDto);
  }

  async findAll() {
    return await this.teachersRepository.find();
  }

  async findOne(id: string) {
    return await this.teachersRepository.findOneBy({ teacher_id: id });
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const user = await this.userService.findOne(updateTeacherDto.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'teacher') {
      throw new BadRequestException('This Objects does not teacher');
    }

    const teacher = await this.teachersRepository.findOneBy({ teacher_id: id });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return this.teachersRepository.update({ teacher_id: id }, updateTeacherDto);
  }

  async remove(id: string) {
    const teacher = await this.teachersRepository.findOneBy({ teacher_id: id });
    if (!teacher) {
      throw new NotFoundException('User not found');
    }

    await this.teachersRepository.delete({ teacher_id: id });
    return teacher;
  }

  async findTeacherCoursesWithDetails(teacherId: string) {
    return await this.teachersRepository.findOne({
      where: { teacher_id: teacherId },
      relations: ['course', 'course.schedule', 'course.subject'],
      select: {
        teacher_id: true,
        course: {
          course_id: true,
          subject_id: true,
          teacher_id: true,
          subject: {
            subject_id: true,
            name: true,
            credits: true,
          },
          schedule: {
            schedule_id: true,
            classroom_id: true,
            dayOfWeek: true,
            start_slot: true,
            end_slot: true,
          },
        },
      },
    });
  }
}
