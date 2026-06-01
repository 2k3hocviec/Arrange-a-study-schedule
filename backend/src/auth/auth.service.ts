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

const REFRESH_TTL = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersServive: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService, // ← thêm
    private readonly redisService: RedisService, // ← thêm
  ) {}

  // ─── HELPER: tạo cặp access + refresh token ───────────────────────────────
  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    // Lưu hashed refresh token vào Redis
    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.redisService.set(`refresh_token:${userId}`, hashed, REFRESH_TTL);

    return { access_token, refresh_token };
  }

  // ─── LOGIN: giữ nguyên logic, chỉ đổi return ──────────────────────────────
  async login(email: string, password: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { access_token, refresh_token } = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    return {
      access_token,
      refresh_token, // controller sẽ lấy cái này set vào cookie
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // ─── REFRESH: nhận raw token từ cookie, verify + cấp token mới ─────────────
  async refreshTokens(rawRefreshToken: string) {
    // 1. Decode để lấy userId
    let payload: any;
    try {
      payload = this.jwtService.verify(rawRefreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    const userId = payload.sub;

    // 2. Lấy hash từ Redis
    const storedHash = await this.redisService.get(`refresh_token:${userId}`);
    if (!storedHash) {
      throw new ForbiddenException(
        'Refresh token đã bị thu hồi hoặc không tồn tại',
      );
    }

    // 3. So sánh token gửi lên với hash đã lưu
    const isMatch = await bcrypt.compare(rawRefreshToken, storedHash);
    if (!isMatch) {
      throw new ForbiddenException('Refresh token không khớp');
    }

    // 4. Cấp cặp token mới (rotation: xóa cũ, tạo mới)
    return this.generateTokens(userId, payload.email, payload.role);
  }

  // ─── LOGOUT: xóa refresh token khỏi Redis ─────────────────────────────────
  async logout(userId: number) {
    await this.redisService.delete(`refresh_token:${userId}`);
  }

  // ─── FORGOT PASSWORD: giữ nguyên hoàn toàn ────────────────────────────────
  async forgotPassword(email: string) {
    const user = await this.usersServive.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email does not exist in the system');
    }

    const newPassword = '123456';
    await this.usersServive.updatePassword(user.id, newPassword);

    try {
      const userName = user.email.split('@')[0];
      await this.mailService.sendNewPasswordEmail(email, newPassword, userName);
    } catch (error) {
      console.error('Failed to send email:', error);
    }

    return { message: 'New password has been sent to your email' };
  }

  // ─── CHANGE PASSWORD: giữ nguyên hoàn toàn ────────────────────────────────
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersServive.findOneById(userId);
    if (!user) throw new NotFoundException('User không tồn tại');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersServive.save(user);

    return { message: 'Đổi mật khẩu thành công' };
  }
}
