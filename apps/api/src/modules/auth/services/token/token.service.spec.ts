/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { TokenService } from './token.service';
import { RedisService } from '../../../../database/redis/redis.service';
import { UserService } from '../../../../modules/user/user.service';
import {
  TokenUser,
  RefreshTokenData,
} from '../../../../common/Interfaces/auth.interface';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let redisService: RedisService;
  let userService: UserService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockUserService = {
    findUserById: jest.fn(),
  };

  const mockUser: TokenUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: {
      id: 1,
      name: 'superadmin',
    },
    permissions: [
      { id: 1, name: 'superadmin:read-user' },
      { id: 2, name: 'superadmin:create-user' },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const signedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      mockJwtService.sign.mockReturnValue(signedToken);

      const result = service.generateAccessToken(mockUser);

      expect(result).toBe(signedToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: 'superadmin',
          permissions: ['superadmin:read-user', 'superadmin:create-user'],
          jti: expect.any(String),
        }),
      );
    });

    it('should handle user without permissions', () => {
      const userWithoutPermissions: TokenUser = {
        ...mockUser,
        permissions: undefined,
      };

      mockJwtService.sign.mockReturnValue('token');

      service.generateAccessToken(userWithoutPermissions);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: [],
        }),
      );
    });

    it('should generate unique jti for each token', () => {
      mockJwtService.sign.mockReturnValue('token');

      service.generateAccessToken(mockUser);
      service.generateAccessToken(mockUser);

      const firstCall = mockJwtService.sign.mock.calls[0][0] as { jti: string };
      const secondCall = mockJwtService.sign.mock.calls[1][0] as {
        jti: string;
      };

      expect(firstCall.jti).not.toBe(secondCall.jti);
      expect(firstCall.jti).toHaveLength(32); // 16 bytes = 32 hex chars
    });
  });

  describe('createRefreshToken', () => {
    it('should create refresh token and store in Redis', async () => {
      mockConfigService.get.mockReturnValue('7d');
      mockRedisService.set.mockResolvedValue(undefined);

      const token = await service.createRefreshToken(mockUser);

      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(redisService.set).toHaveBeenCalledWith(
        `refresh_token:${token}`,
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          createdAt: expect.any(Date),
        }),
        604800000, // 7 days in ms
      );
    });

    it('should add token to user tokens list', async () => {
      mockConfigService.get.mockReturnValue('7d');
      mockRedisService.get.mockResolvedValue([]);
      mockRedisService.set.mockResolvedValue(undefined);

      const token = await service.createRefreshToken(mockUser);

      expect(redisService.set).toHaveBeenCalledWith(
        `user:${mockUser.id}:tokens`,
        [token],
        2592000000, // 30 days
      );
    });

    it('should use default expiry if not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      mockRedisService.set.mockResolvedValue(undefined);

      await service.createRefreshToken(mockUser);

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('refresh_token'),
        expect.any(Object),
        604800000, // Default 7 days
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', async () => {
      const accessToken = 'access_token_12345';
      const refreshToken = 'refresh_token_abcde';

      mockJwtService.sign.mockReturnValue(accessToken);
      mockConfigService.get.mockReturnValue('7d');
      mockRedisService.set.mockResolvedValue(undefined);

      jest.spyOn(service, 'generateAccessToken').mockReturnValue(accessToken);
      jest.spyOn(service, 'createRefreshToken').mockResolvedValue(refreshToken);

      const result = await service.generateTokens(mockUser);

      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
    });
  });

  describe('blacklistToken', () => {
    it('should add token to blacklist with correct TTL', async () => {
      mockConfigService.get.mockReturnValue('15m');
      mockRedisService.set.mockResolvedValue(undefined);

      await service.blacklistToken('jti-12345');

      expect(redisService.set).toHaveBeenCalledWith(
        'jwt_blacklist:jti-12345',
        true,
        900000, // 15 minutes in ms
      );
    });

    it('should use default expiry if not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      mockRedisService.set.mockResolvedValue(undefined);

      await service.blacklistToken('jti-12345');

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('jwt_blacklist'),
        true,
        900000, // Default 15 minutes
      );
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true when token is blacklisted', async () => {
      mockRedisService.get.mockResolvedValue(true);

      const result = await service.isTokenBlacklisted('jti-12345');

      expect(result).toBe(true);
      expect(redisService.get).toHaveBeenCalledWith('jwt_blacklist:jti-12345');
    });

    it('should return false when token is not blacklisted', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.isTokenBlacklisted('jti-12345');

      expect(result).toBe(false);
    });

    it('should return false when Redis returns undefined', async () => {
      mockRedisService.get.mockResolvedValue(undefined);

      const result = await service.isTokenBlacklisted('jti-12345');

      expect(result).toBe(false);
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete refresh token and remove from user tokens', async () => {
      const token = 'refresh_token_abc';
      const tokenData: RefreshTokenData = {
        userId: 1,
        email: 'test@example.com',
        createdAt: new Date(),
      };

      mockRedisService.get
        .mockResolvedValueOnce(tokenData)
        .mockResolvedValueOnce(['token1', token]);
      mockRedisService.del.mockResolvedValue(1);
      mockRedisService.set.mockResolvedValue(undefined);

      await service.revokeRefreshToken(token);

      expect(redisService.del).toHaveBeenCalledWith(`refresh_token:${token}`);
      expect(redisService.get).toHaveBeenCalledWith(
        `user:${tokenData.userId}:tokens`,
      );
    });

    it('should handle revoking non-existent token', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.del.mockResolvedValue(0);

      await service.revokeRefreshToken('non_existent_token');

      expect(redisService.del).toHaveBeenCalledWith(
        'refresh_token:non_existent_token',
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should delete all user tokens from Redis', async () => {
      const userId = 1;
      const tokens = ['token1', 'token2', 'token3'];

      mockRedisService.get.mockResolvedValue(tokens);
      mockRedisService.del.mockResolvedValue(1);

      await service.revokeAllUserTokens(userId);

      expect(redisService.get).toHaveBeenCalledWith(`user:${userId}:tokens`);
      expect(redisService.del).toHaveBeenCalledWith('refresh_token:token1');
      expect(redisService.del).toHaveBeenCalledWith('refresh_token:token2');
      expect(redisService.del).toHaveBeenCalledWith('refresh_token:token3');
      expect(redisService.del).toHaveBeenCalledWith(`user:${userId}:tokens`);
    });

    it('should handle user with no tokens', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.del.mockResolvedValue(0);

      await service.revokeAllUserTokens(1);

      expect(redisService.del).toHaveBeenCalledWith('user:1:tokens');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const oldRefreshToken = 'old_refresh_token';
      const newAccessToken = 'new_access_token';
      const newRefreshToken = 'new_refresh_token';

      const tokenData: RefreshTokenData = {
        userId: 1,
        email: 'test@example.com',
        createdAt: new Date(),
      };

      mockRedisService.get
        .mockResolvedValueOnce(tokenData) // refresh_token data
        .mockResolvedValueOnce(['token1']) // user tokens
        .mockResolvedValueOnce([]); // user tokens after removal

      mockRedisService.set.mockResolvedValue(undefined);
      mockRedisService.del.mockResolvedValue(1);
      mockUserService.findUserById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(newAccessToken);
      mockConfigService.get.mockReturnValue('7d');

      jest
        .spyOn(service, 'generateAccessToken')
        .mockReturnValue(newAccessToken);
      jest
        .spyOn(service, 'createRefreshToken')
        .mockResolvedValue(newRefreshToken);

      const result = await service.refresh(oldRefreshToken);

      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
      expect(userService.findUserById).toHaveBeenCalledWith(tokenData.userId);
      expect(redisService.set).toHaveBeenCalledWith(
        `token_digunakan:${oldRefreshToken}`,
        { userId: tokenData.userId },
        3600000,
      );
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockRedisService.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.refresh('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh('invalid_token')).rejects.toThrow(
        'Token refresh tidak valid atau kedaluwarsa',
      );
    });

    it('should detect token reuse and revoke all user tokens', async () => {
      const reusedToken = 'reused_token';
      const usedTokenData: RefreshTokenData = {
        userId: 1,
        email: 'test@example.com',
        createdAt: new Date(),
      };

      mockRedisService.get
        .mockResolvedValueOnce(null) // 1st: refresh_token doesn't exist
        .mockResolvedValueOnce(usedTokenData) // 2nd: used_token exists (reuse!)
        .mockResolvedValueOnce(['token1', 'token2']); // 3rd: user tokens for revocation

      mockRedisService.del.mockResolvedValue(1);

      try {
        await service.refresh(reusedToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as Error).message).toContain(
          'Token digunakan kembali terdeteksi',
        );
      }

      // Verify all user tokens were revoked
      expect(redisService.del).toHaveBeenCalledWith('refresh_token:token1');
      expect(redisService.del).toHaveBeenCalledWith('refresh_token:token2');
    });

    it('should throw NotFoundException when user not found', async () => {
      const tokenData: RefreshTokenData = {
        userId: 999,
        email: 'deleted@example.com',
        createdAt: new Date(),
      };

      mockRedisService.get.mockResolvedValue(tokenData);
      mockUserService.findUserById.mockResolvedValue(null);

      await expect(service.refresh('valid_token')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.refresh('valid_token')).rejects.toThrow(
        'User tidak ditemukan',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle Redis errors in createRefreshToken', async () => {
      mockConfigService.get.mockReturnValue('7d');
      mockRedisService.set.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(service.createRefreshToken(mockUser)).rejects.toThrow(
        'Redis connection failed',
      );
    });

    it('should handle user without role', () => {
      const userWithoutRole: TokenUser = {
        ...mockUser,
        role: undefined,
      };

      mockJwtService.sign.mockReturnValue('token');

      service.generateAccessToken(userWithoutRole);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          role: undefined,
        }),
      );
    });

    it('should handle empty permissions array', () => {
      const userWithEmptyPermissions: TokenUser = {
        ...mockUser,
        permissions: [],
      };

      mockJwtService.sign.mockReturnValue('token');

      service.generateAccessToken(userWithEmptyPermissions);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: [],
        }),
      );
    });
  });
});
