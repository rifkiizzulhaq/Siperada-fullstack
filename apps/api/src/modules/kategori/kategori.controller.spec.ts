import { Test, TestingModule } from '@nestjs/testing';
import { KategoriController } from './kategori.controller';
import { KategoriService } from './kategori.service';

describe('KategoriController', () => {
  let controller: KategoriController;
  let service: KategoriService;

  const mockKategoriService = {
    findAllKategori: jest.fn(),
    findKategoriById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    searchByParams: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KategoriController],
      providers: [
        {
          provide: KategoriService,
          useValue: mockKategoriService,
        },
      ],
    }).compile();

    controller = module.get<KategoriController>(KategoriController);
    service = module.get<KategoriService>(KategoriService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of kategori', async () => {
      const mockKategoris = [
        { id: 1, name: 'Program', createAt: new Date(), updateAt: new Date() },
        { id: 2, name: 'Kegiatan', createAt: new Date(), updateAt: new Date() },
      ];

      mockKategoriService.findAllKategori.mockResolvedValue(mockKategoris);

      const result = await controller.findAll();

      expect(result).toEqual(mockKategoris);
      expect(service.findAllKategori).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchKategori', () => {
    it('should return paginated search results', async () => {
      const query = {
        search: 'Program',
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'DESC' as const,
      };

      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'Program',
            createAt: new Date(),
            updateAt: new Date(),
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockKategoriService.searchByParams.mockResolvedValue(mockResponse);

      const result = await controller.searchKategori(query);

      expect(result).toEqual(mockResponse);
      expect(service.searchByParams).toHaveBeenCalledWith(query);
    });
  });

  describe('createKategori', () => {
    it('should create and return a new kategori', async () => {
      const createData = { name: 'Program' };
      const mockKategori = {
        id: 1,
        name: 'Program',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKategoriService.create.mockResolvedValue(mockKategori);

      const result = await controller.createKategori(createData);

      expect(result).toEqual(mockKategori);
      expect(service.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateKategori', () => {
    it('should update and return the kategori', async () => {
      const updateData = { name: 'Updated Program' };
      const mockKategori = {
        id: 1,
        name: 'Updated Program',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKategoriService.update.mockResolvedValue(mockKategori);

      const result = await controller.updateKategori(1, updateData);

      expect(result).toEqual(mockKategori);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteKategori', () => {
    it('should delete and return the kategori', async () => {
      const mockKategori = {
        id: 1,
        name: 'Program',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKategoriService.delete.mockResolvedValue(mockKategori);

      const result = await controller.deleteKategori(1);

      expect(result).toEqual(mockKategori);
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
