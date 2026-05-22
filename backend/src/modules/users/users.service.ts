import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create(createUserDto);
    user.createdAt = new Date();
    // Hash mật khẩu trước khi lưu
    if (user.password) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    return await this.usersRepository.save(user);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Nếu cập nhật mật khẩu, hash nó trước
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }
    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.delete({ id });
    return user;
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async findById(id: number) {
    return await this.usersRepository.findOneBy({ id });
  }

  async updatePassword(id: number, newPassword: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('The user does not exist.');
    }
    // Hash mật khẩu mới trước khi lưu
    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    return await this.usersRepository.save(user);
  }

  async getUserId() {
    return await this.usersRepository.find({ select: ['id'] });
  }

  async getAvailableStudents() {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin(Student, 'student', 'student.user_id = user.id')
      .where('user.role = :role', { role: 'student' })
      .andWhere('student.user_id IS NULL')
      .select(['user.id'])
      .getMany();
  }

  async getAvailableTeachers() {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin(Teacher, 'teacher', 'teacher.user_id = user.id')
      .where('user.role = :role', { role: 'teacher' })
      .andWhere('teacher.user_id IS NULL')
      .select(['user.id'])
      .getMany();
  }

  async findOneById(id: number) {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async save(user) {
    return this.usersRepository.save(user);
  }
}
