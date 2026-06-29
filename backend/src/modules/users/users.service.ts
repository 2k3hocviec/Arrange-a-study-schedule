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

  /*
  Cần kiểm tra đây có phải là sysadmin không:
    - sysadmin có thể đổi được mật khẩu, các trường như role, tài khoản không thể thay đổi.
    - các role khác thì tùy ý nhưng không được chuyển thành role == admin
  */
  private ensureSysadminIsNotCredentialEdited(
    user: { email: string; role: string },
    data: Partial<UpdateUserDto>,
  ) {
    if (user.role !== 'sysadmin') {
      return;
    }

    const changesEmail = data.email !== undefined && data.email !== user.email;
    const changesRole = data.role !== undefined && data.role !== user.role;
    if (changesEmail || changesRole) {
      throw new BadRequestException(
        'Cannot change email or role of sysadmin user',
      );
    }
  }

  private async ensureLinkedProfileRoleIsNotChanged(
    userId: number,
    currentRole: string,
    nextRole?: string,
  ) {
    if (nextRole === undefined || nextRole === currentRole) {
      return;
    }

    const [student, teacher] = await Promise.all([
      this.prisma.student.findUnique({
        where: { user_id: userId },
        select: { student_id: true },
      }),
      this.prisma.teacher.findUnique({
        where: { user_id: userId },
        select: { teacher_id: true },
      }),
    ]);

    if (student) {
      throw new BadRequestException(
        'Cannot change role because this user is linked to a student profile',
      );
    }

    if (teacher) {
      throw new BadRequestException(
        'Cannot change role because this user is linked to a teacher profile',
      );
    }
  }

  /*
  Không thể tạo thêm tài khoản role admin để đảm bảo có duy nhất 1 admin.
  */
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

    const { currentPassword, ...data } = updateUserDto;
    this.ensureSysadminIsNotCredentialEdited(user, data);
    await this.ensureLinkedProfileRoleIsNotChanged(id, user.role, data.role);

    if (user.role === 'sysadmin') {
      delete data.email;
      delete data.role;

      if (data.password) {
        if (!currentPassword) {
          throw new BadRequestException(
            'Current password is required to change sysadmin password',
          );
        }

        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password,
        );
        if (!isCurrentPasswordValid) {
          throw new BadRequestException('Current password is incorrect');
        }
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({ where: { id }, data });
  }

  /*
  Không thể xóa user admin (user admin đang là duy nhất)
  Khôgn thể xóa tài khoản đang liên kết với student hoặc teacher.
  */
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
