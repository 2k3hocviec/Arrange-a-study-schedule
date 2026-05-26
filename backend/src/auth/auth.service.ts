import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';

// OTP store tạm thời trong memory (key=email, value={otp, expiry})
const otpStore = new Map<string, { otp: string; expiry: number }>();

const ALLOWED_ROLES = ['student', 'teacher', 'ministry', 'sysadmin'];

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
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // ─── Bước 1: Gửi OTP ───
  async sendOtp(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 phút
    otpStore.set(email, { otp, expiry });

    try {
      const userName = user.email.split('@')[0];
      await this.mailService.sendOtpEmail(email, otp, userName);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException(
          'Không thể gửi email. Kiểm tra cấu hình SMTP trong .env',
      );
    }
    return { message: 'Mã OTP đã được gửi tới email của bạn' };
  }

  // ─── Bước 2: Xác minh OTP ───
  async verifyOtp(email: string, otp: string) {
    const stored = otpStore.get(email);
    if (!stored) {
      throw new BadRequestException(
          'Không tìm thấy yêu cầu OTP cho email này. Vui lòng gửi lại.',
      );
    }
    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu lại.');
    }
    if (stored.otp !== otp) {
      throw new BadRequestException('Mã OTP không đúng');
    }
    otpStore.delete(email);

    // Tạo reset token tạm 10 phút
    const resetToken = this.jwtService.sign(
        { email, purpose: 'reset-password' },
        { expiresIn: '10m' },
    );
    return { message: 'Xác minh OTP thành công', reset_token: resetToken };
  }

  // ─── Bước 3: Đặt mật khẩu mới ───
  async resetPassword(resetToken: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken);
    } catch {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
    if (payload.purpose !== 'reset-password') {
      throw new BadRequestException('Token không hợp lệ');
    }
    const user = await this.usersServive.findByEmail(payload.email);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }
    // updatePassword trong UsersService tự hash → truyền plain text vào
    await this.usersServive.updatePassword(user.id, newPassword);
    return { message: 'Mật khẩu đã được cập nhật thành công' };
  }

  // ─── Forgot password cũ (giữ lại) ───
  async forgotPassword(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }
    const newPassword = '123456';
    // updatePassword tự hash → truyền plain text
    await this.usersServive.updatePassword(user.id, newPassword);
    try {
      const userName = user.email.split('@')[0];
      await this.mailService.sendNewPasswordEmail(email, newPassword, userName);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
    return { message: 'Mật khẩu mới đã được gửi tới email của bạn' };
  }
}
