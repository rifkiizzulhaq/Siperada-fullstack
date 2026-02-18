import { BadRequestException, Injectable } from '@nestjs/common';
import { Login } from '../../common/Interfaces/auth.interface';
import * as argon2 from 'argon2';
import { UserService } from '../user/user.service';
import { TokenService } from './services/token/token.service';
import { SecurityService } from './services/security/security.service';
import { LoginResponse } from '../../common/Interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly securityService: SecurityService,
  ) {}

  login = async (data: Login): Promise<LoginResponse> => {
    await this.securityService.checkAccountLockout(data.email);
    const user = await this.userService.findUserByEmail(data.email);

    const isMatch = await argon2.verify(user.password, data.password);
    if (!isMatch) {
      await this.securityService.incrementFailedAttempts(data.email);
      throw new BadRequestException('Email atau password salah');
    }

    await this.securityService.resetFailedAttempts(data.email);

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(user);

    return {
      user,
      accessToken,
      refreshToken,
    };
  };

  async logout(token: string) {
    await this.tokenService.revokeRefreshToken(token);
    return { message: 'Logged out successfully' };
  }

  async refresh(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.tokenService.refresh(token);
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    return this.tokenService.isTokenBlacklisted(jti);
  }

  async blacklistToken(jti: string): Promise<void> {
    return this.tokenService.blacklistToken(jti);
  }
}
