import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RedisService } from '../../../../database/redis/redis.service';
import { UserService } from '../../../../modules/user/user.service';
import {
  RefreshTokenData,
  TokenUser,
} from '../../../../common/Interfaces/auth.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async generateTokens(user: TokenUser) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    return { accessToken, refreshToken };
  }

  generateAccessToken(user: TokenUser): string {
    const jti = crypto.randomBytes(16).toString('hex');
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name,
      permissions: user.permissions?.map((p) => p.name) || [],
      jti,
    };

    const signed = this.jwtService.sign(payload);
    return signed;
  }

  async createRefreshToken(user: TokenUser): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const refreshExpiry =
      this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';
    const expiryDays = parseInt(refreshExpiry.replace('d', ''));
    const ttlSeconds = expiryDays * 24 * 60 * 60;
    const tokenData: RefreshTokenData = {
      userId: user.id,
      email: user.email,
      createdAt: new Date(),
    };

    await this.redisService.set(
      `refresh_token:${token}`,
      tokenData,
      ttlSeconds * 1000,
    );

    await this.addToUserTokens(user.id, token);
    return token;
  }

  async revokeRefreshToken(token: string) {
    const data = await this.redisService.get<RefreshTokenData>(
      `refresh_token:${token}`,
    );
    await this.redisService.del(`refresh_token:${token}`);

    if (data) {
      await this.removeFromUserTokens(data.userId, token);
    }
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    const key = `user:${userId}:tokens`;
    const tokens = (await this.redisService.get<string[]>(key)) || [];

    for (const token of tokens) {
      await this.redisService.del(`refresh_token:${token}`);
    }

    await this.redisService.del(key);
  }

  async blacklistToken(jti: string): Promise<void> {
    const accessExpiry =
      this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m';
    const expiryMinutes = parseInt(accessExpiry.replace('m', ''));
    const ttlMs = expiryMinutes * 60 * 1000;

    await this.redisService.set(`jwt_blacklist:${jti}`, true, ttlMs);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const blacklisted = await this.redisService.get(`jwt_blacklist:${jti}`);
    return !!blacklisted;
  }

  async refresh(token: string) {
    const data = await this.redisService.get<RefreshTokenData>(
      `refresh_token:${token}`,
    );

    if (!data) {
      const wasUsed = await this.redisService.get<any>(
        `used_token:${token}`,
      );

      if (wasUsed) {
        // Graceful Refresh Logic: Check if token was rotated recently (e.g. within 15 seconds)
        const GRACE_PERIOD_MS = 15000;
        const timeSinceRotation = Date.now() - (wasUsed.rotatedAt || 0);

        if (wasUsed.rotatedTo && timeSinceRotation < GRACE_PERIOD_MS) {
          // Return the already rotated tokens
          return wasUsed.rotatedTo;
        }

        // If outside grace period or critical reuse detected
        await this.revokeAllUserTokens(wasUsed.userId);
        throw new UnauthorizedException(
          'Token digunakan kembali terdeteksi. Semua sesi telah dihentikan demi keamanan.',
        );
      }
      throw new UnauthorizedException(
        'Token refresh tidak valid atau kedaluwarsa',
      );
    }

    const user = await this.userService.findUserById(data.userId);

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.createRefreshToken(user);

    // Store used token with rotation info for grace period
    await this.redisService.set(
      `used_token:${token}`,
      { 
        userId: data.userId,
        rotatedTo: { accessToken, refreshToken: newRefreshToken },
        rotatedAt: Date.now()
      },
      3600000, 
    );
    
    await this.revokeRefreshToken(token);

    return { accessToken, refreshToken: newRefreshToken };
  }

  private async addToUserTokens(userId: number, token: string) {
    const key = `user:${userId}:tokens`;
    const tokens = (await this.redisService.get<string[]>(key)) || [];
    tokens.push(token);

    await this.redisService.set(key, tokens, 60 * 60 * 24 * 30 * 1000);
  }

  private async removeFromUserTokens(userId: number, token: string) {
    const key = `user:${userId}:tokens`;
    const tokens = (await this.redisService.get<string[]>(key)) || [];
    const filtered = tokens.filter((t) => t !== token);

    await this.redisService.set(key, filtered, 60 * 60 * 24 * 30 * 1000);
  }
}
