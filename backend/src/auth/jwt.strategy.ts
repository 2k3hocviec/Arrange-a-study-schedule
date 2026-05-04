import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '123', // Phải giống với secret trong AuthModule
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

//@UseGuards(AuthGuard('jwt')) khi mà được gọi hàm này sẽ được chạy
//nói đúng hơn nếu dùng postman nó sẽ chạy Authorization: Bearer <token> đoạn này
//lấy và xác thực gọi validate()
