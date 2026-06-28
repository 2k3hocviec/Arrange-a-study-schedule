import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /*
  Dùng để lưu một refresh token vào redis, tham số ttlSeconds là thời gian sẽ tự động xóa khỏi redis.
  */
  async set(key: string, value: string, ttlSeconds: number) {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  /*
  - Lấy refresh token để kiểm tra khi access token của người dùng hết hạn.
  - Hàm kiểm tra sẽ nằm trong auth nằm trong refreshesToken.
  */
  async get(key: string) {
    return this.redis.get(key);
  }

  /*
  Xóa refresh token lưu trong redis khi người dùng đăng xuất
  */
  async delete(key: string) {
    await this.redis.del(key);
  }
}
