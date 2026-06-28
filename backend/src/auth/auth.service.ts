import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';
import * as bcrypt from 'bcrypt';

const otpStore = new Map<string, { otp: string; expiry: number }>();
const REFRESH_TTL = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersServive: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  private getAccessSecret() {
    return (
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      this.configService.get<string>('JWT_SECRET') ||
      '123'
    );
  }

  private getRefreshSecret() {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'jwt_refresh_secret_key'
    );
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getAccessSecret(),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getRefreshSecret(),
        expiresIn: '7d',
      }),
    ]);

    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.redisService.set(`refresh_token:${userId}`, hashed, REFRESH_TTL);

    return { access_token, refresh_token };
  }

  async login(email: string, password: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email or password unvalid');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password unvalid');
    }

    const { access_token, refresh_token } = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    return {
      access_token,
      refresh_token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async refreshTokens(rawRefreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(rawRefreshToken, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Refresh token unvalid or expire');
    }

    const userId = payload.sub;
    const storedHash = await this.redisService.get(`refresh_token:${userId}`);
    if (!storedHash) {
      throw new ForbiddenException(
        'Refresh token da bi thu hoi hoac khong ton tai',
      );
    }

    const isMatch = await bcrypt.compare(rawRefreshToken, storedHash);
    if (!isMatch) {
      throw new ForbiddenException('Refresh token unvalid');
    }

    return this.generateTokens(userId, payload.email, payload.role);
  }

  async logout(userId: number) {
    await this.redisService.delete(`refresh_token:${userId}`);
  }

  async sendOtp(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email not Found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiry });

    try {
      const userName = user.email.split('@')[0];
      await this.mailService.sendOtpEmail(email, otp, userName);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException('Can not send email. Check SMTP in .env');
    }

    return { message: 'The OTP has been sent to you' };
  }

  async verifyOtp(email: string, otp: string) {
    const stored = otpStore.get(email);
    if (!stored) {
      throw new BadRequestException('Not found OTP. Try again.');
    }
    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      throw new BadRequestException(
        'The OTP code has expired. Please request it again.',
      );
    }
    if (stored.otp !== otp) {
      throw new BadRequestException('The OTP code is incorrect.');
    }

    otpStore.delete(email);
    const resetToken = this.jwtService.sign(
      { email, purpose: 'reset-password' },
      { secret: this.getAccessSecret(), expiresIn: '10m' },
    );

    return { message: 'OTP verification successful', reset_token: resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken, {
        secret: this.getAccessSecret(),
      });
    } catch {
      throw new BadRequestException('Token khong hop le hoac da het han');
    }

    if (payload.purpose !== 'reset-password') {
      throw new BadRequestException('Token khong hop le');
    }

    const user = await this.usersServive.findByEmail(payload.email);
    if (!user) {
      throw new BadRequestException('Nguoi dung khong ton tai');
    }

    await this.usersServive.updatePassword(user.id, newPassword);
    return { message: 'Mat khau da duoc cap nhat thanh cong' };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersServive.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'sysadmin') {
      throw new BadRequestException('Cannot change password of sysadmin user');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password is incorret');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersServive.save(user);

    return { message: 'Change Password success' };
  }
}
