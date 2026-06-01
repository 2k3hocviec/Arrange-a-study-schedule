import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/role/public.decorator';
import { ChangePasswordDto } from './dto/change.password.dto';
import * as Express from 'express';
import type { Response } from 'express';

interface RequestWithUser extends Express.Request {
  user: {
    sub: string;
    email: string;
    // Thêm các thuộc tính khác của user nếu có (ví dụ: role, name...)
  };
}

// Cookie config dùng chung
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // JS không đọc được → chống XSS
  secure: process.env.NODE_ENV === 'production', // chỉ HTTPS ở production
  sameSite: 'lax' as const, // chống CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (ms)
  path: '/auth/refresh', // cookie chỉ gửi lên endpoint này
};

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  @Post('/login')
  @Public()
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(
      body.email,
      body.password,
    );

    // Refresh token → HttpOnly cookie (không lộ ra JS)
    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_OPTIONS);

    // Chỉ trả access_token + user info ra body
    return { access_token, user };
  }

  // ─── REFRESH TOKEN ─────────────────────────────────────────────────────────
  @Post('/refresh')
  @Public() // không có access token khi gọi endpoint này
  async refresh(
    @Req() req: Express.Request, // Đã sửa thành Express.Request để nhận diện thuộc tính 'cookies'
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('Không tìm thấy refresh token');

    const { access_token, refresh_token } =
      await this.authService.refreshTokens(token);

    // Cập nhật cookie với refresh token mới (rotation)
    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_OPTIONS);

    return { access_token };
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  @Post('/logout')
  // KHÔNG @Public() → cần access token hợp lệ, JwtAuthGuard global sẽ check
  async logout(
    @Req() req: Express.Request, // Đã thêm kiểu dữ liệu tường minh
    @Res({ passthrough: true }) res: Response,
  ) {
    // Ép kiểu (req.user as any) đề phòng TypeScript chưa nhận diện được cấu trúc của payload trong JWT
    const userId = (req.user as any)?.sub;
    await this.authService.logout(userId);

    // Xóa cookie
    res.clearCookie('refresh_token', { path: '/auth/refresh' });

    return { message: 'Logged out successfully' };
  }

  // ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
  @Post('/forgot-password')
  @Public()
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  // ─── CHANGE PASSWORD ───────────────────────────────────────────────────────
  @Patch('/change-password')
  changePassword(
    @Req() req: Express.Request, // Đã thêm kiểu dữ liệu tường minh
    @Body() body: ChangePasswordDto,
  ) {
    const userId = (req.user as any)?.sub;
    return this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }
}
