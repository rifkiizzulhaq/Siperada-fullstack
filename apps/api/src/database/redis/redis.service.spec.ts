import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constant';

interface MockRedis {
  get: jest.Mock;
  setex: jest.Mock;
  del: jest.Mock;
  exists: jest.Mock;
  ttl: jest.Mock;
}

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisClient: MockRedis;

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return parsed value when key exists', async () => {
      const mockData = { foo: 'bar' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockData));

      const result = await service.get('test-key');

      expect(result).toEqual(mockData);
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('non-existent-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value with TTL', async () => {
      const key = 'test-key';
      const value = { foo: 'bar' };
      const ttlMs = 5000;

      void (await service.set(key, value, ttlMs));

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        key,
        5,
        JSON.stringify(value),
      );
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      const key = 'test-key';

      void (await service.del(key));

      expect(mockRedisClient.del).toHaveBeenCalledWith(key);
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);

      const result = await service.exists('test-key');

      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);

      const result = await service.exists('non-existent-key');

      expect(result).toBe(false);
    });
  });

  describe('ttl', () => {
    it('should return TTL for key', async () => {
      mockRedisClient.ttl.mockResolvedValue(120);

      const result = await service.ttl('test-key');

      expect(result).toBe(120);
      expect(mockRedisClient.ttl).toHaveBeenCalledWith('test-key');
    });
  });
});
