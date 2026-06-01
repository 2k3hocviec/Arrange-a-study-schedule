import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule,
    RedisModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_ACCESS_SECRET') ||
          config.get<string>('JWT_SECRET') ||
          '123',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RedisService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
