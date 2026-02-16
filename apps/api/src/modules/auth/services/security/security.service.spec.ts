/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';
import { RedisService } from '../../../../database/redis/redis.service';
import { UnauthorizedException } from '@nestjs/common';

describe('SecurityService', () => {
  let service: SecurityService;
  let redisService: RedisService;

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ttl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
    redisService = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAccountLockout', () => {
    it('should not throw when account is not locked and attempts < 5', async () => {
      mockRedisService.get
        .mockResolvedValueOnce(null) // Akun Terkunci key
        .mockResolvedValueOnce(3); // Login Gagal attempts

      await expect(
        service.checkAccountLockout('test@example.com'),
      ).resolves.not.toThrow();

      expect(redisService.get).toHaveBeenCalledWith(
        'Akun Terkunci:test@example.com',
      );
      expect(redisService.get).toHaveBeenCalledWith(
        'Login Gagal:test@example.com',
      );
    });

    it('should throw UnauthorizedException when account is already locked', async () => {
      mockRedisService.get.mockResolvedValue(true); // Account is locked
      mockRedisService.ttl.mockResolvedValue(300); // 5 minutes remaining

      await expect(
        service.checkAccountLockout('test@example.com'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.checkAccountLockout('test@example.com'),
      ).rejects.toThrow(/Akun terkunci\. Silakan coba lagi dalam 5 menit\./);

      expect(redisService.get).toHaveBeenCalledWith(
        'Akun Terkunci:test@example.com',
      );
      expect(redisService.ttl).toHaveBeenCalledWith(
        'Akun Terkunci:test@example.com',
      );
    });

    it('should lock account on 5th failed attempt with 5 minute lockout (first lockout)', async () => {
      mockRedisService.get
        .mockResolvedValueOnce(null) // Not locked yet
        .mockResolvedValueOnce(5) // 5 failed attempts
        .mockResolvedValueOnce(null); // No previous lockout count

      try {
        await service.checkAccountLockout('test@example.com');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as Error).message).toContain('Akun terkunci karena');
        expect((error as Error).message).toContain('5 menit');
      }

      expect(redisService.set).toHaveBeenCalledWith(
        'Akun Terkunci:test@example.com',
        true,
        300000, // 5 minutes in ms
      );
      expect(redisService.del).toHaveBeenCalledWith(
        'Login Gagal:test@example.com',
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'Jumlah Percobaan Login Gagal:test@example.com',
        1,
        86400000, // 24 hours
      );
    });

    it('should increase lockout duration progressively (2nd lockout = 10 minutes)', async () => {
      mockRedisService.get
        .mockResolvedValueOnce(null) // Not locked
        .mockResolvedValueOnce(5) // 5 failed attempts
        .mockResolvedValueOnce(1); // 1 previous lockout

      await expect(
        service.checkAccountLockout('test@example.com'),
      ).rejects.toThrow(
        /Akun terkunci karena terlalu banyak percobaan login yang gagal\. Silakan coba lagi dalam 10 menit\./,
      );

      expect(redisService.set).toHaveBeenCalledWith(
        'Akun Terkunci:test@example.com',
        true,
        600000, // 10 minutes
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'Jumlah Percobaan Login Gagal:test@example.com',
        2,
        86400000,
      );
    });

    it('should cap lockout duration at 30 minutes (max)', async () => {
      mockRedisService.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(10); // 10+ previous lockouts

      await expect(
        service.checkAccountLockout('test@example.com'),
      ).rejects.toThrow(
        /Akun terkunci karena terlalu banyak percobaan login yang gagal\. Silakan coba lagi dalam 30 menit\./,
      );

      expect(redisService.set).toHaveBeenCalledWith(
        'Akun Terkunci:test@example.com',
        true,
        1800000, // 30 minutes (max)
      );
    });

    it('should handle 4 failed attempts without locking', async () => {
      mockRedisService.get
        .mockResolvedValueOnce(null) // Not locked
        .mockResolvedValueOnce(4); // Only 4 attempts

      await expect(
        service.checkAccountLockout('test@example.com'),
      ).resolves.not.toThrow();

      expect(redisService.set).not.toHaveBeenCalled();
    });
  });

  describe('incrementFailedAttempts', () => {
    it('should set failed attempts to 1 when no previous attempts exist', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await service.incrementFailedAttempts('test@example.com');

      expect(redisService.get).toHaveBeenCalledWith(
        'Login Gagal:test@example.com',
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'Login Gagal:test@example.com',
        1,
        1800000, // 30 minutes
      );
    });

    it('should increment existing failed attempts count', async () => {
      mockRedisService.get.mockResolvedValue(3);

      await service.incrementFailedAttempts('test@example.com');

      expect(redisService.set).toHaveBeenCalledWith(
        'Login Gagal:test@example.com',
        4,
        1800000,
      );
    });

    it('should increment from 4 to 5 attempts', async () => {
      mockRedisService.get.mockResolvedValue(4);

      await service.incrementFailedAttempts('test@example.com');

      expect(redisService.set).toHaveBeenCalledWith(
        'Login Gagal:test@example.com',
        5,
        1800000,
      );
    });

    it('should handle email with special characters', async () => {
      mockRedisService.get.mockResolvedValue(null);

      await service.incrementFailedAttempts('user+tag@example.co.id');

      expect(redisService.get).toHaveBeenCalledWith(
        'Login Gagal:user+tag@example.co.id',
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'Login Gagal:user+tag@example.co.id',
        1,
        1800000,
      );
    });
  });

  describe('resetFailedAttempts', () => {
    it('should delete failed attempts after successful login', async () => {
      await service.resetFailedAttempts('test@example.com');

      expect(redisService.del).toHaveBeenCalledWith(
        'Login Gagal:test@example.com',
      );
    });

    it('should work with any email format', async () => {
      await service.resetFailedAttempts('admin.user@domain.com');

      expect(redisService.del).toHaveBeenCalledWith(
        'Login Gagal:admin.user@domain.com',
      );
    });

    it('should handle Indonesian email domains', async () => {
      await service.resetFailedAttempts('user@company.co.id');

      expect(redisService.del).toHaveBeenCalledWith(
        'Login Gagal:user@company.co.id',
      );
    });
  });

  describe('getRemainingLockTime', () => {
    it('should return remaining seconds when account is locked', async () => {
      mockRedisService.ttl.mockResolvedValue(420); // 7 minutes

      const result = await service.getRemainingLockTime('test@example.com');

      expect(result).toBe(420);
      expect(redisService.ttl).toHaveBeenCalledWith(
        'Akun Terkunci:test@example.com',
      );
    });

    it('should return 0 when ttl is negative (key expired or does not exist)', async () => {
      mockRedisService.ttl.mockResolvedValue(-2);

      const result = await service.getRemainingLockTime('test@example.com');

      expect(result).toBe(0);
    });

    it('should return 0 when ttl is 0', async () => {
      mockRedisService.ttl.mockResolvedValue(0);

      const result = await service.getRemainingLockTime('test@example.com');

      expect(result).toBe(0);
    });
  });

  describe('integration: complete login failure flow', () => {
    it('should track failed attempts and lock account after 5 failures', async () => {
      const email = 'user@example.com';

      // Attempt 1
      mockRedisService.get.mockResolvedValue(null);
      await service.incrementFailedAttempts(email);
      expect(redisService.set).toHaveBeenLastCalledWith(
        'Login Gagal:user@example.com',
        1,
        1800000,
      );

      // Attempt 2
      mockRedisService.get.mockResolvedValue(1);
      await service.incrementFailedAttempts(email);
      expect(redisService.set).toHaveBeenLastCalledWith(
        'Login Gagal:user@example.com',
        2,
        1800000,
      );

      // Attempt 3
      mockRedisService.get.mockResolvedValue(2);
      await service.incrementFailedAttempts(email);

      // Attempt 4
      mockRedisService.get.mockResolvedValue(3);
      await service.incrementFailedAttempts(email);

      // Attempt 5
      mockRedisService.get.mockResolvedValue(4);
      await service.incrementFailedAttempts(email);
      expect(redisService.set).toHaveBeenLastCalledWith(
        'Login Gagal:user@example.com',
        5,
        1800000,
      );

      // Check lockout triggers
      mockRedisService.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(null);

      await expect(service.checkAccountLockout(email)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'Akun Terkunci:user@example.com',
        true,
        300000,
      );
    });

    it('should allow login after successful authentication (reset)', async () => {
      const email = 'user@example.com';

      // Failed attempts exist
      mockRedisService.get.mockResolvedValue(3);

      // Successful login
      await service.resetFailedAttempts(email);
      expect(redisService.del).toHaveBeenCalledWith(
        'Login Gagal:user@example.com',
      );

      // Next failed attempt starts from 1
      mockRedisService.get.mockResolvedValue(null);
      await service.incrementFailedAttempts(email);
      expect(redisService.set).toHaveBeenCalledWith(
        'Login Gagal:user@example.com',
        1,
        1800000,
      );
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle Redis get errors', async () => {
      mockRedisService.get.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(
        service.checkAccountLockout('test@example.com'),
      ).rejects.toThrow('Redis connection failed');
    });

    it('should handle Redis set errors', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.set.mockRejectedValueOnce(
        new Error('Redis write failed'),
      );

      await expect(
        service.incrementFailedAttempts('test@example.com'),
      ).rejects.toThrow('Redis write failed');

      mockRedisService.set.mockResolvedValue(undefined);
    });

    it('should handle Redis del errors', async () => {
      mockRedisService.del.mockRejectedValue(new Error('Redis delete failed'));

      await expect(
        service.resetFailedAttempts('test@example.com'),
      ).rejects.toThrow('Redis delete failed');
    });

    it('should handle empty email', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue(undefined);

      await service.incrementFailedAttempts('');

      expect(redisService.get).toHaveBeenCalledWith('Login Gagal:');
      expect(redisService.set).toHaveBeenCalled();
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'verylongemailaddress'.repeat(10) + '@example.com';
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.set.mockResolvedValue(undefined);

      await service.incrementFailedAttempts(longEmail);

      expect(redisService.get).toHaveBeenCalledWith(`Login Gagal:${longEmail}`);
      expect(redisService.set).toHaveBeenCalled();
    });

    it('should format error message with remaining time correctly', async () => {
      mockRedisService.get.mockResolvedValue(true);
      mockRedisService.ttl.mockResolvedValue(900);

      try {
        await service.checkAccountLockout('test@example.com');
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as Error).message).toContain('15 menit');
        expect((error as Error).message).toContain('|900');
      }
    });
  });
});
