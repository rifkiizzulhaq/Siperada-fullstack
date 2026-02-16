import { Test, TestingModule } from '@nestjs/testing';
import { KomponenProgramService } from './komponen_program.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KomponenProgram } from './entities/komponen-program.entities';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { KategoriService } from '../kategori/kategori.service';

describe('KomponenProgramService', () => {
  let service: KomponenProgramService;
  let repository: Repository<KomponenProgram>;
  let kategoriService: KategoriService;

  const mockKpRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockKategoriService = {
    findKategoriById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KomponenProgramService,
        {
          provide: getRepositoryToken(KomponenProgram),
          useValue: mockKpRepository,
        },
        {
          provide: KategoriService,
          useValue: mockKategoriService,
        },
      ],
    }).compile();

    service = module.get<KomponenProgramService>(KomponenProgramService);
    repository = module.get<Repository<KomponenProgram>>(
      getRepositoryToken(KomponenProgram),
    );
    kategoriService = module.get<KategoriService>(KategoriService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllKomponenProgram', () => {
    it('should return an array of komponen program with kategori relation', async () => {
      const mockData = [
        {
          id: 1,
          kategoriId: 1,
          kode_parent: undefined,
          kode: '023.18.DL',
          name: 'Program pendidikan',
          kategori: { id: 1, name: 'Program' },
          createAt: new Date(),
          updateAt: new Date(),
        },
      ];

      mockKpRepository.find.mockResolvedValue(mockData);

      const result = await service.findAllKomponenProgram();

      expect(result).toEqual(mockData);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['kategori'],
      });
    });
  });

  describe('findKomponenProgramById', () => {
    it('should return a komponen program when found', async () => {
      const mockKp = {
        id: 1,
        kategoriId: 1,
        kode_parent: undefined,
        kode: '023.18.DL',
        name: 'Program pendidikan',
        kategori: { id: 1, name: 'Program' },
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKpRepository.findOne.mockResolvedValue(mockKp);

      const result = await service.findKomponenProgramById(1);

      expect(result).toEqual(mockKp);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['kategori'],
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockKpRepository.findOne.mockResolvedValue(null);

      await expect(service.findKomponenProgramById(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findKomponenProgramById(999)).rejects.toThrow(
        'Komponen Program tidak ditemukan',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new komponen program', async () => {
      const createData = {
        kategoriId: 1,
        kode_parent: undefined,
        kode: '023.18.DL',
        name: 'Program pendidikan',
      };

      const mockKategori = { id: 1, name: 'Program' };
      const mockKp = {
        id: 1,
        ...createData,
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKategoriService.findKategoriById.mockResolvedValue(mockKategori);
      mockKpRepository.create.mockReturnValue(mockKp);
      mockKpRepository.save.mockResolvedValue(mockKp);

      const result = await service.create(createData);

      expect(result).toEqual(mockKp);
      expect(kategoriService.findKategoriById).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledWith({
        kategoriId: 1,
        kode_parent: undefined,
        kode: '023.18.DL',
        name: 'Program pendidikan',
      });
      expect(repository.save).toHaveBeenCalledWith(mockKp);
    });

    it('should throw NotFoundException when kategori not found', async () => {
      const createData = {
        kategoriId: 999,
        kode_parent: undefined,
        kode: '023.18.DL',
        name: 'Program pendidikan',
      };

      mockKategoriService.findKategoriById.mockRejectedValue(
        new NotFoundException('Kategori tidak ditemukan'),
      );

      await expect(service.create(createData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the komponen program', async () => {
      const updateData = { name: 'Updated Program' };
      const mockKp = {
        id: 1,
        kategoriId: 1,
        kode_parent: undefined,
        kode: '023.18.DL',
        name: 'Updated Program',
        kategori: { id: 1, name: 'Program' },
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKpRepository.update.mockResolvedValue({ affected: 1 });
      mockKpRepository.findOne.mockResolvedValue(mockKp);

      const result = await service.update(1, updateData);

      expect(result).toEqual(mockKp);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw NotFoundException when updating non-existent komponen program', async () => {
      const updateData = { name: 'Updated Program' };

      mockKpRepository.update.mockResolvedValue({ affected: 1 });
      mockKpRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete and return the komponen program', async () => {
      const mockKp = {
        id: 1,
        kategoriId: 1,
        kode_parent: undefined,
        kode: '023.18.DL',
        name: 'Program pendidikan',
        kategori: { id: 1, name: 'Program' },
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKpRepository.findOne.mockResolvedValue(mockKp);
      mockKpRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(1);

      expect(result).toEqual(mockKp);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when deleting non-existent komponen program', async () => {
      mockKpRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchByParams', () => {
    it('should return paginated search results with kategori relation', async () => {
      const mockData = [
        {
          id: 1,
          kategoriId: 1,
          kode_parent: undefined,
          kode: '023.18.DL',
          name: 'Program pendidikan',
          kategori: { id: 1, name: 'Program' },
          createAt: new Date(),
          updateAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockData, 1]),
      };

      mockKpRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

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

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'kp.kategori',
        'kategori',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        '(kp.name LIKE :search OR kp.kode LIKE :search)',
        { search: '%Program%' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('kp.id', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should use default values when query params not provided', async () => {
      const mockData = [];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockData, 0]),
      };

      mockKpRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchByParams({});

      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('kp.id', 'DESC');
    });
  });
});
