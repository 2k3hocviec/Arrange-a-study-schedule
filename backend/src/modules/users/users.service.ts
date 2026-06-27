import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureRoleIsNotSysadmin(role?: string) {
    if (role === 'sysadmin') {
      throw new BadRequestException('Cannot create user with sysadmin role');
    }
  }

  private ensureSysadminIsNotCredentialEdited(
    user: { role: string },
    data: Partial<UpdateUserDto>,
  ) {
    if (user.role !== 'sysadmin') {
      return;
    }

    const protectedFields = ['email', 'role'].filter(
      (field) => data[field] !== undefined,
    );

    if (protectedFields.length > 0) {
      throw new BadRequestException(
        'Cannot change email or role of sysadmin user',
      );
    }
  }

  async create(createUserDto: CreateUserDto) {
    const data = { ...createUserDto };
    this.ensureRoleIsNotSysadmin(data.role);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.create({ data });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data = { ...updateUserDto };
    this.ensureSysadminIsNotCredentialEdited(user, data);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'sysadmin') {
      throw new BadRequestException('Cannot delete sysadmin user');
    }

    const [student, teacher] = await Promise.all([
      this.prisma.student.findUnique({ where: { user_id: id } }),
      this.prisma.teacher.findUnique({ where: { user_id: id } }),
    ]);

    if (student || teacher) {
      throw new BadRequestException(
        'Cannot delete user that is linked to a student or teacher profile',
      );
    }

    await this.prisma.user.delete({ where: { id } });
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.findOne(id);
  }

  async updatePassword(id: number, newPassword: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('The user does not exist.');
    }

    if (user.role === 'sysadmin') {
      throw new BadRequestException('Cannot change password of sysadmin user');
    }

    return this.prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
  }

  async getUserId() {
    return this.prisma.user.findMany({ select: { id: true } });
  }

  async getAvailableStudents() {
    return this.prisma.user.findMany({
      where: {
        role: 'student',
        student: null,
      },
      select: { id: true, email: true },
    });
  }

  async getAvailableTeachers() {
    return this.prisma.user.findMany({
      where: {
        role: 'teacher',
        teacher: null,
      },
      select: { id: true, email: true },
    });
  }

  async findOneById(id: number) {
    return this.findOne(id);
  }

  async save(user: any) {
    const { id, ...data } = user;
    return this.prisma.user.update({ where: { id }, data });
  }
}
