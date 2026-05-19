import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersServive: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // So sánh mật khẩu nhập vào với hash mật khẩu trong database
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

    // Tạo token reset password (có hiệu lực trong 1 giờ)
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '1h' },
    );

    // Lưu token vào database hoặc cache (tuỳ chọn)
    // Có thể sử dụng Redis để lưu token với expiry time

    // TODO: Gửi email với liên kết reset password
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, resetLink);

    return {
      message: 'Password reset email has been sent',
      // Trong development, có thể return token để test
      resetToken: resetToken, // Xoá dòng này trong production
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersServive.findById(decoded.sub);

      if (!user) {
        throw new BadRequestException('The user does not exist');
      }

      // Cập nhật mật khẩu
      await this.usersServive.updatePassword(user.id, newPassword);

      return {
        message: 'Password has been successfully updated',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
