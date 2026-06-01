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
      throw new UnauthorizedException('Email hoac mat khau khong dung');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoac mat khau khong dung');
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
      throw new UnauthorizedException(
        'Refresh token khong hop le hoac da het han',
      );
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
      throw new ForbiddenException('Refresh token khong khop');
    }

    return this.generateTokens(userId, payload.email, payload.role);
  }

  async logout(userId: number) {
    await this.redisService.delete(`refresh_token:${userId}`);
  }

  async sendOtp(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email khong ton tai trong he thong');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiry });

    try {
      const userName = user.email.split('@')[0];
      await this.mailService.sendOtpEmail(email, otp, userName);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new BadRequestException(
        'Khong the gui email. Kiem tra cau hinh SMTP trong .env',
      );
    }

    return { message: 'Ma OTP da duoc gui toi email cua ban' };
  }

  async verifyOtp(email: string, otp: string) {
    const stored = otpStore.get(email);
    if (!stored) {
      throw new BadRequestException('Khong tim thay yeu cau OTP. Vui long gui lai.');
    }
    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      throw new BadRequestException('Ma OTP da het han. Vui long yeu cau lai.');
    }
    if (stored.otp !== otp) {
      throw new BadRequestException('Ma OTP khong dung');
    }

    otpStore.delete(email);
    const resetToken = this.jwtService.sign(
      { email, purpose: 'reset-password' },
      { secret: this.getAccessSecret(), expiresIn: '10m' },
    );

    return { message: 'Xac minh OTP thanh cong', reset_token: resetToken };
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

  async forgotPassword(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email khong ton tai trong he thong');
    }

    const newPassword = '123456';
    await this.usersServive.updatePassword(user.id, newPassword);

    try {
      const userName = user.email.split('@')[0];
      await this.mailService.sendNewPasswordEmail(email, newPassword, userName);
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    return { message: 'Mat khau moi da duoc gui toi email cua ban' };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersServive.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User khong ton tai');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mat khau hien tai khong dung');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersServive.save(user);

    return { message: 'Doi mat khau thanh cong' };
  }
}
