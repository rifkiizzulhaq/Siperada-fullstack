import { Test, TestingModule } from '@nestjs/testing';
import { KategoriService } from './kategori.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Kategori } from './entities/kategori.entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('KategoriService', () => {
  let service: KategoriService;
  let repository: Repository<Kategori>;

  const mockKategoriRepository = {
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
        KategoriService,
        {
          provide: getRepositoryToken(Kategori),
          useValue: mockKategoriRepository,
        },
      ],
    }).compile();

    service = module.get<KategoriService>(KategoriService);
    repository = module.get<Repository<Kategori>>(getRepositoryToken(Kategori));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllKategori', () => {
    it('should return an array of kategori', async () => {
      const mockKategoris = [
        { id: 1, name: 'Program', createAt: new Date(), updateAt: new Date() },
        { id: 2, name: 'Kegiatan', createAt: new Date(), updateAt: new Date() },
      ];

      mockKategoriRepository.find.mockResolvedValue(mockKategoris);

      const result = await service.findAllKategori();

      expect(result).toEqual(mockKategoris);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findKategoriById', () => {
    it('should return a kategori when found', async () => {
      const mockKategori = {
        id: 1,
        name: 'Program',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKategoriRepository.findOneBy.mockResolvedValue(mockKategori);

      const result = await service.findKategoriById(1);

      expect(result).toEqual(mockKategori);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when kategori not found', async () => {
      mockKategoriRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findKategoriById(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findKategoriById(999)).rejects.toThrow(
        'Kategori tidak ditemukan',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new kategori', async () => {
      const createData = { name: 'Program' };
      const mockKategori = {
        id: 1,
        name: 'Program',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKategoriRepository.create.mockReturnValue(mockKategori);
      mockKategoriRepository.save.mockResolvedValue(mockKategori);

      const result = await service.create(createData);

      expect(result).toEqual(mockKategori);
      expect(repository.create).toHaveBeenCalledWith({ name: 'Program' });
      expect(repository.save).toHaveBeenCalledWith(mockKategori);
    });
  });

  describe('update', () => {
    it('should update and return the kategori', async () => {
      const updateData = { name: 'Updated Program' };
      const mockKategori = {
        id: 1,
        name: 'Updated Program',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKategoriRepository.update.mockResolvedValue({ affected: 1 });
      mockKategoriRepository.findOneBy.mockResolvedValue(mockKategori);

      const result = await service.update(1, updateData);

      expect(result).toEqual(mockKategori);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when updating non-existent kategori', async () => {
      const updateData = { name: 'Updated Program' };

      mockKategoriRepository.update.mockResolvedValue({ affected: 1 });
      mockKategoriRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete and return the kategori', async () => {
      const mockKategori = {
        id: 1,
        name: 'Program',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKategoriRepository.findOneBy.mockResolvedValue(mockKategori);
      mockKategoriRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(result).toEqual(mockKategori);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting non-existent kategori', async () => {
      mockKategoriRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchByParams', () => {
    it('should return paginated search results', async () => {
      const mockData = [
        { id: 1, name: 'Program', createAt: new Date(), updateAt: new Date() },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockData, 1]),
      };

      mockKategoriRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const query = {
        search: 'Program',
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
        '(kategori.name LIKE :search)',
        {
          search: '%Program%',
        },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'kategori.id',
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

      mockKategoriRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.searchByParams({});

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'kategori.id',
        'DESC',
      );
    });
  });
});
