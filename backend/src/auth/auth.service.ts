import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';
import type { Response, Request } from 'express';

// OTP store tạm thời trong memory
const otpStore = new Map<string, { otp: string; expiry: number }>();

// Secret riêng cho refresh token (khác access token)
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_key';
const ACCESS_SECRET  = process.env.JWT_SECRET         || 'jwt_access_secret_key';

@Injectable()
export class AuthService {
  constructor(
      private readonly usersServive: UsersService,
      private readonly jwtService: JwtService,
      private readonly mailService: MailService,
  ) {}

  // ─── Tạo Access Token (15 phút) ───
  private createAccessToken(payload: { sub: number; email: string; role: string }) {
    return this.jwtService.sign(payload, {
      secret: ACCESS_SECRET,
      expiresIn: '15m',
    });
  }

  // ─── Tạo Refresh Token (7 ngày) ───
  private createRefreshToken(payload: { sub: number; email: string; role: string }) {
    return this.jwtService.sign(payload, {
      secret: REFRESH_SECRET,
      expiresIn: '7d',
    });
  }

  // ─── Set Refresh Token vào httpOnly Cookie ───
  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,      // JS không đọc được → bảo mật khỏi XSS
      secure: false,       // Đổi thành true khi dùng HTTPS (production)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (ms)
      path: '/',
    });
  }

  // ─── LOGIN ───
  async login(email: string, password: string, res: Response) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken  = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    // Gửi refresh token qua cookie httpOnly
    this.setRefreshTokenCookie(res, refreshToken);

    return {
      access_token: accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // ─── REFRESH: FE gọi khi access token hết hạn ───
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Không có refresh token. Vui lòng đăng nhập lại.');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: REFRESH_SECRET });
    } catch {
      // Refresh token hết hạn hoặc không hợp lệ → yêu cầu login lại
      res.clearCookie('refresh_token');
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    // Kiểm tra user vẫn còn tồn tại trong DB
    const user = await this.usersServive.findById(payload.sub);
    if (!user) {
      res.clearCookie('refresh_token');
      throw new UnauthorizedException('Tài khoản không tồn tại.');
    }

    // Cấp access token mới (refresh token giữ nguyên - không cần đổi)
    const newPayload    = { sub: user.id, email: user.email, role: user.role };
    const newAccessToken = this.createAccessToken(newPayload);

    return { access_token: newAccessToken };
  }

  // ─── LOGOUT ───
  async logout(res: Response) {
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Đăng xuất thành công' };
  }

  // ─── OTP: Bước 1 - Gửi OTP ───
  async sendOtp(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiry });

    try {
      const userName = user.email.split('@')[0];
      await this.mailService.sendOtpEmail(email, otp, userName);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException('Không thể gửi email. Kiểm tra cấu hình SMTP trong .env');
    }
    return { message: 'Mã OTP đã được gửi tới email của bạn' };
  }

  // ─── OTP: Bước 2 - Xác minh OTP ───
  async verifyOtp(email: string, otp: string) {
    const stored = otpStore.get(email);
    if (!stored) {
      throw new BadRequestException('Không tìm thấy yêu cầu OTP. Vui lòng gửi lại.');
    }
    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu lại.');
    }
    if (stored.otp !== otp) {
      throw new BadRequestException('Mã OTP không đúng');
    }
    otpStore.delete(email);

    const resetToken = this.jwtService.sign(
        { email, purpose: 'reset-password' },
        { secret: ACCESS_SECRET, expiresIn: '10m' },
    );
    return { message: 'Xác minh OTP thành công', reset_token: resetToken };
  }

  // ─── OTP: Bước 3 - Đặt mật khẩu mới ───
  async resetPassword(resetToken: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken, { secret: ACCESS_SECRET });
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
    await this.usersServive.updatePassword(user.id, newPassword);
    return { message: 'Mật khẩu đã được cập nhật thành công' };
  }

  // ─── Forgot password (gửi mật khẩu mới qua email) ───
  async forgotPassword(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }
    const newPassword = '123456';
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
