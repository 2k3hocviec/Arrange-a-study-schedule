import { Body, Controller, Patch, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/role/public.decorator';
import { ChangePasswordDto } from './dto/change.password.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Public()
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('/forgot-password')
  @Public()
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Patch('change-password')
  changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.sub,
      body.currentPassword,
      body.newPassword,
    );
  }
}
