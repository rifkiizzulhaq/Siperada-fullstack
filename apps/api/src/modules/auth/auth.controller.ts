import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Transform } from '../../common/interceptor/transform.interceptor';
import { AuthResponseTransform } from './transform/auth-response.transform';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorator/public.decorator';
import { Throttle } from '@nestjs/throttler';

interface RequestWithUser extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    permissions: { id: number; name: string }[];
    jti: string;
  };
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
@Transform(AuthResponseTransform)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { ttl: 900000, limit: 5 } })
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Body('token') bodyToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (bodyToken || req.cookies?.['refreshToken']) as
      | string
      | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refreshToken'] as string | undefined;
    const user = req.user;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    if (user?.jti) {
      await this.authService.blacklistToken(user.jti);
    }

    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }
}
