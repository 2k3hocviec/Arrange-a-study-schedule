import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/role/public.decorator';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Public()
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // ─── OTP Forgot Password (3 bước) ───
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

  // Giữ lại endpoint cũ
  @Post('/forgot-password')
  @Public()
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }
}
