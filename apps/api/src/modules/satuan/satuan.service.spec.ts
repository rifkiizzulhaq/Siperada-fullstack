import { Test, TestingModule } from '@nestjs/testing';
import { SatuanService } from './satuan.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Satuan } from './entities/satuan.entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('SatuanService', () => {
  let service: SatuanService;
  let repository: Repository<Satuan>;

  const mockSatuanRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SatuanService,
        {
          provide: getRepositoryToken(Satuan),
          useValue: mockSatuanRepository,
        },
      ],
    }).compile();

    service = module.get<SatuanService>(SatuanService);
    repository = module.get<Repository<Satuan>>(getRepositoryToken(Satuan));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllSatuan', () => {
    it('should return an array of satuan', async () => {
      const mockSatuans = [
        { id: 1, name: 'Bulan', createAt: new Date(), updateAt: new Date() },
        { id: 2, name: 'Tahun', createAt: new Date(), updateAt: new Date() },
      ];

      mockSatuanRepository.find.mockResolvedValue(mockSatuans);

      const result = await service.findAllSatuan();

      expect(result).toEqual(mockSatuans);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findSatuanById', () => {
    it('should return a satuan when found', async () => {
      const mockSatuan = {
        id: 1,
        name: 'Bulan',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockSatuanRepository.findOneBy.mockResolvedValue(mockSatuan);

      const result = await service.findSatuanById(1);

      expect(result).toEqual(mockSatuan);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when satuan not found', async () => {
      mockSatuanRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findSatuanById(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findSatuanById(999)).rejects.toThrow(
        'Satuan tidak ditemukan',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new satuan', async () => {
      const createData = { name: 'Bulan' };
      const mockSatuan = {
        id: 1,
        name: 'Bulan',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockSatuanRepository.create.mockReturnValue(mockSatuan);
      mockSatuanRepository.save.mockResolvedValue(mockSatuan);

      const result = await service.create(createData);

      expect(result).toEqual(mockSatuan);
      expect(repository.create).toHaveBeenCalledWith({ name: 'Bulan' });
      expect(repository.save).toHaveBeenCalledWith(mockSatuan);
    });
  });

  describe('update', () => {
    it('should update and return the satuan', async () => {
      const updateData = { name: 'Updated Bulan' };
      const mockSatuan = {
        id: 1,
        name: 'Updated Bulan',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockSatuanRepository.update.mockResolvedValue({ affected: 1 });
      mockSatuanRepository.findOneBy.mockResolvedValue(mockSatuan);

      const result = await service.update(1, updateData);

      expect(result).toEqual(mockSatuan);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when updating non-existent satuan', async () => {
      const updateData = { name: 'Updated Bulan' };

      mockSatuanRepository.update.mockResolvedValue({ affected: 1 });
      mockSatuanRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete and return the satuan', async () => {
      const mockSatuan = {
        id: 1,
        name: 'Bulan',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockSatuanRepository.findOneBy.mockResolvedValue(mockSatuan);
      mockSatuanRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(result).toEqual(mockSatuan);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting non-existent satuan', async () => {
      mockSatuanRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchByParams', () => {
    it('should return paginated search results', async () => {
      const mockData = [
        { id: 1, name: 'Bulan', createAt: new Date(), updateAt: new Date() },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockData, 1]),
      };

      mockSatuanRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const query = {
        search: 'Bulan',
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'DESC' as const,
      };

      const result = await service.searchByParams(query);

      expect(result).toEqual({
        data: mockData,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(satuan.name LIKE :search)',
        {
          search: '%Bulan%',
        },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'satuan.id',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should use default values when query params not provided', async () => {
      const mockData = [];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockData, 0]),
      };

      mockSatuanRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchByParams({});

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'satuan.id',
        'DESC',
      );
    });
  });
});
