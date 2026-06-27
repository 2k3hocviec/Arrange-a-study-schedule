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
import type { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    role: string;
  };
}

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/auth/refresh',
};

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_OPTIONS);
    return { access_token, user };
  }

  @Post('/refresh')
  @Public()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { access_token, refresh_token } =
      await this.authService.refreshTokens(token);

    res.cookie('refresh_token', refresh_token, REFRESH_COOKIE_OPTIONS);
    return { access_token };
  }

  @Post('/logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User token not found');
    }

    await this.authService.logout(userId);
    res.clearCookie('refresh_token', { path: '/auth/refresh' });

    return { message: 'Logged out successfully' };
  }

  @Post('/send-otp')
  @Public()
  async sendOtp(@Body() body: { email: string }) {
    return this.authService.sendOtp(body.email);
  }

  @Post('/verify-otp')
  @Public()
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('/reset-password')
  @Public()
  async resetPassword(
    @Body() body: { reset_token: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.reset_token, body.newPassword);
  }

  @Patch('/change-password')
  changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: ChangePasswordDto,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }
}
