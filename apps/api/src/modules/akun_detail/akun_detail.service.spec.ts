import { Test, TestingModule } from '@nestjs/testing';
import { AkunDetailService } from './akun_detail.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AkunDetail } from './entities/akun-detail.entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('AkunDetailService', () => {
  let service: AkunDetailService;
  let repository: Repository<AkunDetail>;

  const mockAkunDetailRepository = {
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
        AkunDetailService,
        {
          provide: getRepositoryToken(AkunDetail),
          useValue: mockAkunDetailRepository,
        },
      ],
    }).compile();

    service = module.get<AkunDetailService>(AkunDetailService);
    repository = module.get<Repository<AkunDetail>>(
      getRepositoryToken(AkunDetail),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllAkunDetail', () => {
    it('should return an array of akun detail', async () => {
      const mockAkunDetails = [
        {
          id: 1,
          kode: '52115',
          name: 'Belanja Honor',
          createAt: new Date(),
          updateAt: new Date(),
        },
        {
          id: 2,
          kode: '52116',
          name: 'Belanja Lembur',
          createAt: new Date(),
          updateAt: new Date(),
        },
      ];

      mockAkunDetailRepository.find.mockResolvedValue(mockAkunDetails);

      const result = await service.findAllAkunDetail();

      expect(result).toEqual(mockAkunDetails);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAkunDetailById', () => {
    it('should return an akun detail when found', async () => {
      const mockAkunDetail = {
        id: 1,
        kode: '52115',
        name: 'Belanja Honor',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockAkunDetailRepository.findOneBy.mockResolvedValue(mockAkunDetail);

      const result = await service.findAkunDetailById(1);

      expect(result).toEqual(mockAkunDetail);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when akun detail not found', async () => {
      mockAkunDetailRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findAkunDetailById(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findAkunDetailById(999)).rejects.toThrow(
        'Akun detail tidak ditemukan',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new akun detail', async () => {
      const createData = { kode: '52115', name: 'Belanja Honor' };
      const mockAkunDetail = {
        id: 1,
        kode: '52115',
        name: 'Belanja Honor',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockAkunDetailRepository.create.mockReturnValue(mockAkunDetail);
      mockAkunDetailRepository.save.mockResolvedValue(mockAkunDetail);

      const result = await service.create(createData);

      expect(result).toEqual(mockAkunDetail);
      expect(repository.create).toHaveBeenCalledWith({
        kode: '52115',
        name: 'Belanja Honor',
      });
      expect(repository.save).toHaveBeenCalledWith(mockAkunDetail);
    });
  });

  describe('update', () => {
    it('should update and return the akun detail', async () => {
      const updateData = { name: 'Updated Belanja Honor' };
      const mockAkunDetail = {
        id: 1,
        kode: '52115',
        name: 'Updated Belanja Honor',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockAkunDetailRepository.update.mockResolvedValue({ affected: 1 });
      mockAkunDetailRepository.findOneBy.mockResolvedValue(mockAkunDetail);

      const result = await service.update(1, updateData);

      expect(result).toEqual(mockAkunDetail);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when updating non-existent akun detail', async () => {
      const updateData = { name: 'Updated Belanja Honor' };

      mockAkunDetailRepository.update.mockResolvedValue({ affected: 1 });
      mockAkunDetailRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete and return the akun detail', async () => {
      const mockAkunDetail = {
        id: 1,
        kode: '52115',
        name: 'Belanja Honor',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockAkunDetailRepository.findOneBy.mockResolvedValue(mockAkunDetail);
      mockAkunDetailRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(result).toEqual(mockAkunDetail);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting non-existent akun detail', async () => {
      mockAkunDetailRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchByParams', () => {
    it('should return paginated search results with name and kode search', async () => {
      const mockData = [
        {
          id: 1,
          kode: '52115',
          name: 'Belanja Honor',
          createAt: new Date(),
          updateAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockData, 1]),
      };

      mockAkunDetailRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const query = {
        search: 'Honor',
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
        '(AkunDetail.name LIKE :search OR AkunDetail.kode LIKE :search)',
        { search: '%Honor%' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'AkunDetail.id',
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

      mockAkunDetailRepository.createQueryBuilder.mockReturnValue(
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
        'AkunDetail.id',
        'DESC',
      );
    });
  });
});
