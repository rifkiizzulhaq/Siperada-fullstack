/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { TokenUser } from '../../common/Interfaces/auth.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    blacklistToken: jest.fn(),
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
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and set cookie', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const loginResponse = {
        user: mockUser,
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(loginDto, mockResponse);

      expect(result).toEqual({
        user: mockUser,
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
      });
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        loginResponse.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );
    });

    it('should handle login failure', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      mockAuthService.login.mockRejectedValue(
        new Error('Email atau password salah'),
      );

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        'Email atau password salah',
      );

      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh tokens using cookie', async () => {
      const refreshToken = 'refresh_token_from_cookie';
      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      mockAuthService.refresh.mockResolvedValue(newTokens);

      const mockRequest = {
        cookies: {
          refreshToken: refreshToken,
        },
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.refresh(mockRequest, '', mockResponse);

      expect(result).toEqual({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      });
      expect(authService.refresh).toHaveBeenCalledWith(refreshToken);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        newTokens.refreshToken,
        expect.any(Object),
      );
    });

    it('should refresh tokens using body token', async () => {
      const bodyToken = 'refresh_token_from_body';
      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      mockAuthService.refresh.mockResolvedValue(newTokens);

      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.refresh(
        mockRequest,
        bodyToken,
        mockResponse,
      );

      expect(result).toEqual(newTokens);
      expect(authService.refresh).toHaveBeenCalledWith(bodyToken);
    });

    it('should prioritize body token over cookie', async () => {
      const bodyToken = 'body_token';
      const cookieToken = 'cookie_token';
      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      mockAuthService.refresh.mockResolvedValue(newTokens);

      const mockRequest = {
        cookies: {
          refreshToken: cookieToken,
        },
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await controller.refresh(mockRequest, bodyToken, mockResponse);

      expect(authService.refresh).toHaveBeenCalledWith(bodyToken);
    });

    it('should throw UnauthorizedException when no refresh token', async () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(
        controller.refresh(mockRequest, '', mockResponse),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        controller.refresh(mockRequest, '', mockResponse),
      ).rejects.toThrow('Refresh token not found');

      expect(authService.refresh).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully with refresh token and user', async () => {
      const refreshToken = 'refresh_token_123';
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'superadmin',
        permissions: ['read', 'write'],
        jti: 'jti_123',
      };

      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });
      mockAuthService.blacklistToken.mockResolvedValue(undefined);

      const mockRequest = {
        cookies: {
          refreshToken: refreshToken,
        },
        user: user,
      } as unknown as Request;

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockRequest, mockResponse);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(authService.logout).toHaveBeenCalledWith(refreshToken);
      expect(authService.blacklistToken).toHaveBeenCalledWith(user.jti);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
    });

    it('should logout without refresh token', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'superadmin',
        permissions: ['read'],
        jti: 'jti_456',
      };

      mockAuthService.blacklistToken.mockResolvedValue(undefined);

      const mockRequest = {
        cookies: {},
        user: user,
      } as unknown as Request;

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.logout(mockRequest, mockResponse);

      expect(authService.logout).not.toHaveBeenCalled();
      expect(authService.blacklistToken).toHaveBeenCalledWith(user.jti);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
    });

    it('should logout without user jti', async () => {
      const refreshToken = 'refresh_token_789';

      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      const mockRequest = {
        cookies: {
          refreshToken: refreshToken,
        },
        user: undefined,
      } as unknown as Request;

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await controller.logout(mockRequest, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith(refreshToken);
      expect(authService.blacklistToken).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken');
    });

    it('should clear cookie even if logout fails', async () => {
      const refreshToken = 'refresh_token_error';
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'admin',
        permissions: [],
        jti: 'jti_error',
      };

      mockAuthService.logout.mockRejectedValue(new Error('Logout error'));

      const mockRequest = {
        cookies: {
          refreshToken: refreshToken,
        },
        user: user,
      } as unknown as Request;

      const mockResponse = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      await expect(
        controller.logout(mockRequest, mockResponse),
      ).rejects.toThrow('Logout error');
    });
  });

  describe('edge cases', () => {
    it('should handle missing cookies object', async () => {
      const mockRequest = {
        // No cookies property
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(
        controller.refresh(mockRequest, '', mockResponse),
      ).rejects.toThrow('Refresh token not found');
    });

    it('should handle empty string body token', async () => {
      const cookieToken = 'cookie_refresh_token';
      const newTokens = {
        accessToken: 'new_token',
        refreshToken: 'new_refresh',
      };

      mockAuthService.refresh.mockResolvedValue(newTokens);

      const mockRequest = {
        cookies: {
          refreshToken: cookieToken,
        },
      } as unknown as Request;

      const mockResponse = {
        cookie: jest.fn(),
      } as unknown as Response;

      // Empty string should fall back to cookie
      await controller.refresh(mockRequest, '', mockResponse);

      expect(authService.refresh).toHaveBeenCalledWith(cookieToken);
    });
  });
});
