import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../../../../database/redis/redis.service';

@Injectable()
export class SecurityService {
  constructor(private readonly redisService: RedisService) {}

  private getLockoutDuration(lockoutCount: number): number {
    const durations = [1, 5, 5, 5, 5, 5];
    const index = Math.min(lockoutCount - 1, durations.length - 1);
    return durations[index] * 60 * 1000;
  }

  async checkAccountLockout(email: string): Promise<void> {
    const lockKey = `Akun Terkunci:${email}`;
    const isLocked = await this.redisService.get(lockKey);

    if (isLocked) {
      const remainingSeconds = await this.getRemainingLockTime(email);
      throw new UnauthorizedException(
        `Akun terkunci. Silakan coba lagi dalam ${Math.ceil(remainingSeconds / 60)} menit.|${remainingSeconds}`,
      );
    }

    const failedKey = `Login Gagal:${email}`;
    const lockoutCountKey = `Jumlah Percobaan Login Gagal:${email}`;
    const attempts = (await this.redisService.get<number>(failedKey)) || 0;

    if (attempts >= 5) {
      const lockoutCount =
        ((await this.redisService.get<number>(lockoutCountKey)) || 0) + 1;
      const lockoutDuration = this.getLockoutDuration(lockoutCount);
      const lockoutMinutes = lockoutDuration / 60000;

      await this.redisService.set(lockKey, true, lockoutDuration);
      await this.redisService.del(failedKey);

      await this.redisService.set(
        lockoutCountKey,
        lockoutCount,
        24 * 60 * 60 * 1000,
      );

      throw new UnauthorizedException(
        `Akun terkunci karena terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam ${lockoutMinutes} menit.|${lockoutDuration / 1000}`,
      );
    }
  }

  async incrementFailedAttempts(email: string): Promise<void> {
    const failedKey = `Login Gagal:${email}`;
    const attempts = (await this.redisService.get<number>(failedKey)) || 0;
    await this.redisService.set(failedKey, attempts + 1, 1800000);
  }

  async resetFailedAttempts(email: string): Promise<void> {
    const failedKey = `Login Gagal:${email}`;
    await this.redisService.del(failedKey);
  }

  async getRemainingLockTime(email: string): Promise<number> {
    const ttl = await this.redisService.ttl(`Akun Terkunci:${email}`);
    return ttl > 0 ? ttl : 0;
  }
}
