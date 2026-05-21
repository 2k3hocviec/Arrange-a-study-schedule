import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersServive: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    //So sánh mật khẩu nhập vào với hash mật khẩu trong database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email does not exist in the system');
    }

    // Tạo mật khẩu mặc định
    const newPassword = '123456';

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu trong database
    await this.usersServive.updatePassword(user.id, newPassword);

    // Gửi email với mật khẩu mới
    try {
      const userName = user.email.split('@')[0]; // Lấy tên từ email
      await this.mailService.sendNewPasswordEmail(email, newPassword, userName);
    } catch (error) {
      console.error('Failed to send email:', error);
      // Email lỗi không block request, vẫn return thành công
    }

    return {
      message: 'New password has been sent to your email',
    };
  }
}
