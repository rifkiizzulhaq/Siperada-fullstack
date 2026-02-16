/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from './services/token/token.service';
import { SecurityService } from './services/security/security.service';
import { Login, TokenUser } from '../../common/Interfaces/auth.interface';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let tokenService: TokenService;
  let securityService: SecurityService;

  const mockUserService = {
    findUserByEmail: jest.fn(),
  };

  const mockTokenService = {
    generateTokens: jest.fn(),
    revokeRefreshToken: jest.fn(),
    refresh: jest.fn(),
    isTokenBlacklisted: jest.fn(),
    blacklistToken: jest.fn(),
  };

  const mockSecurityService = {
    checkAccountLockout: jest.fn(),
    incrementFailedAttempts: jest.fn(),
    resetFailedAttempts: jest.fn(),
  };

  const mockUser: TokenUser = {
    id: 1,
    email: 'test@example.com',
    password: '$argon2id$v=19$m=65536,t=3,p=4$...',
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
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tokenService = module.get<TokenService>(TokenService);
    securityService = module.get<SecurityService>(SecurityService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginData: Login = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      const tokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
      };

      mockSecurityService.checkAccountLockout.mockResolvedValue(undefined);
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);
      mockTokenService.generateTokens.mockResolvedValue(tokens);
      mockSecurityService.resetFailedAttempts.mockResolvedValue(undefined);

      // Mock argon2.verify to return true
      const argon2 = require('argon2');
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);

      const result = await service.login(loginData);

      expect(result).toEqual({
        user: mockUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      expect(securityService.checkAccountLockout).toHaveBeenCalledWith(
        loginData.email,
      );
      expect(userService.findUserByEmail).toHaveBeenCalledWith(loginData.email);
      expect(securityService.resetFailedAttempts).toHaveBeenCalledWith(
        loginData.email,
      );
      expect(tokenService.generateTokens).toHaveBeenCalledWith(mockUser);
    });

    it('should throw BadRequestException for invalid password', async () => {
      mockSecurityService.checkAccountLockout.mockResolvedValue(undefined);
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);
      mockSecurityService.incrementFailedAttempts.mockResolvedValue(undefined);

      // Mock argon2.verify to return false
      const argon2 = require('argon2');
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      await expect(service.login(loginData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginData)).rejects.toThrow(
        'Email atau password salah',
      );

      expect(securityService.incrementFailedAttempts).toHaveBeenCalledWith(
        loginData.email,
      );
      expect(securityService.resetFailedAttempts).not.toHaveBeenCalled();
      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });

    it('should check account lockout before login', async () => {
      const lockoutError = new Error('Account locked');
      mockSecurityService.checkAccountLockout.mockRejectedValue(lockoutError);

      await expect(service.login(loginData)).rejects.toThrow('Account locked');

      expect(securityService.checkAccountLockout).toHaveBeenCalledWith(
        loginData.email,
      );
      expect(userService.findUserByEmail).not.toHaveBeenCalled();
    });

    it('should increment failed attempts on wrong password', async () => {
      mockSecurityService.checkAccountLockout.mockResolvedValue(undefined);
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);

      const argon2 = require('argon2');
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      try {
        await service.login(loginData);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }

      expect(securityService.incrementFailedAttempts).toHaveBeenCalledWith(
        loginData.email,
      );
    });

    it('should handle user not found error', async () => {
      mockSecurityService.checkAccountLockout.mockResolvedValue(undefined);
      mockUserService.findUserByEmail.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.login(loginData)).rejects.toThrow('User not found');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const refreshToken = 'refresh_token_123';
      mockTokenService.revokeRefreshToken.mockResolvedValue(undefined);

      const result = await service.logout(refreshToken);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
    });

    it('should handle logout with any refresh token', async () => {
      const refreshToken = 'any_token';
      mockTokenService.revokeRefreshToken.mockResolvedValue(undefined);

      await service.logout(refreshToken);

      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens successfully', async () => {
      const oldToken = 'old_refresh_token';
      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      mockTokenService.refresh.mockResolvedValue(newTokens);

      const result = await service.refresh(oldToken);

      expect(result).toEqual(newTokens);
      expect(tokenService.refresh).toHaveBeenCalledWith(oldToken);
    });

    it('should handle invalid refresh token', async () => {
      const invalidToken = 'invalid_token';
      mockTokenService.refresh.mockRejectedValue(
        new Error('Invalid refresh token'),
      );

      await expect(service.refresh(invalidToken)).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true when token is blacklisted', async () => {
      const jti = 'jti_123';
      mockTokenService.isTokenBlacklisted.mockResolvedValue(true);

      const result = await service.isTokenBlacklisted(jti);

      expect(result).toBe(true);
      expect(tokenService.isTokenBlacklisted).toHaveBeenCalledWith(jti);
    });

    it('should return false when token is not blacklisted', async () => {
      const jti = 'jti_456';
      mockTokenService.isTokenBlacklisted.mockResolvedValue(false);

      const result = await service.isTokenBlacklisted(jti);

      expect(result).toBe(false);
      expect(tokenService.isTokenBlacklisted).toHaveBeenCalledWith(jti);
    });
  });

  describe('blacklistToken', () => {
    it('should blacklist token successfully', async () => {
      const jti = 'jti_789';
      mockTokenService.blacklistToken.mockResolvedValue(undefined);

      await service.blacklistToken(jti);

      expect(tokenService.blacklistToken).toHaveBeenCalledWith(jti);
    });

    it('should handle blacklisting errors', async () => {
      const jti = 'jti_error';
      mockTokenService.blacklistToken.mockRejectedValue(
        new Error('Redis error'),
      );

      await expect(service.blacklistToken(jti)).rejects.toThrow('Redis error');
    });
  });

  describe('integration scenarios', () => {
    it('should complete full login flow', async () => {
      const loginData: Login = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      mockSecurityService.checkAccountLockout.mockResolvedValue(undefined);
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);
      mockTokenService.generateTokens.mockResolvedValue(tokens);
      mockSecurityService.resetFailedAttempts.mockResolvedValue(undefined);

      const argon2 = require('argon2');
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);

      const result = await service.login(loginData);

      // Verify complete flow
      expect(securityService.checkAccountLockout).toHaveBeenCalled();
      expect(userService.findUserByEmail).toHaveBeenCalled();
      expect(securityService.resetFailedAttempts).toHaveBeenCalled();
      expect(tokenService.generateTokens).toHaveBeenCalled();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe(tokens.accessToken);
      expect(result.refreshToken).toBe(tokens.refreshToken);
    });

    it('should handle failed login and increment attempts', async () => {
      const loginData: Login = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      mockSecurityService.checkAccountLockout.mockResolvedValue(undefined);
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);
      mockSecurityService.incrementFailedAttempts.mockResolvedValue(undefined);

      const argon2 = require('argon2');
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      try {
        await service.login(loginData);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }

      expect(securityService.incrementFailedAttempts).toHaveBeenCalled();
      expect(securityService.resetFailedAttempts).not.toHaveBeenCalled();
    });
  });
});
