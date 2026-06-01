import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        configService.get<string>('JWT_SECRET') ||
        '123',
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

//@UseGuards(AuthGuard('jwt')) khi mà được gọi hàm này sẽ được chạy
//nói đúng hơn nếu dùng postman nó sẽ chạy Authorization: Bearer <token> đoạn này
//lấy và xác thực gọi validate()
