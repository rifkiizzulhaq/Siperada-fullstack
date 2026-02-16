import { Test, TestingModule } from '@nestjs/testing';
import { SatuanController } from './satuan.controller';
import { SatuanService } from './satuan.service';

describe('SatuanController', () => {
  let controller: SatuanController;
  let service: SatuanService;

  const mockSatuanService = {
    findAllSatuan: jest.fn(),
    findSatuanById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    searchByParams: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SatuanController],
      providers: [
        {
          provide: SatuanService,
          useValue: mockSatuanService,
        },
      ],
    }).compile();

    controller = module.get<SatuanController>(SatuanController);
    service = module.get<SatuanService>(SatuanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of satuan', async () => {
      const mockSatuans = [
        { id: 1, name: 'Bulan', createAt: new Date(), updateAt: new Date() },
        { id: 2, name: 'Tahun', createAt: new Date(), updateAt: new Date() },
      ];

      mockSatuanService.findAllSatuan.mockResolvedValue(mockSatuans);

      const result = await controller.findAll();

      expect(result).toEqual(mockSatuans);
      expect(service.findAllSatuan).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchSatuan', () => {
    it('should return paginated search results', async () => {
      const query = {
        search: 'Bulan',
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'DESC' as const,
      };

      const mockResponse = {
        data: [
          { id: 1, name: 'Bulan', createAt: new Date(), updateAt: new Date() },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockSatuanService.searchByParams.mockResolvedValue(mockResponse);

      const result = await controller.searchSatuan(query);

      expect(result).toEqual(mockResponse);
      expect(service.searchByParams).toHaveBeenCalledWith(query);
    });
  });

  describe('createSatuan', () => {
    it('should create and return a new satuan', async () => {
      const createData = { name: 'Bulan' };
      const mockSatuan = {
        id: 1,
        name: 'Bulan',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockSatuanService.create.mockResolvedValue(mockSatuan);

      const result = await controller.createSatuan(createData);

      expect(result).toEqual(mockSatuan);
      expect(service.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateSatuan', () => {
    it('should update and return the satuan', async () => {
      const updateData = { name: 'Updated Bulan' };
      const mockSatuan = {
        id: 1,
        name: 'Updated Bulan',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockSatuanService.update.mockResolvedValue(mockSatuan);

      const result = await controller.updateSatuan(1, updateData);

      expect(result).toEqual(mockSatuan);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteSatuan', () => {
    it('should delete and return the satuan', async () => {
      const mockSatuan = {
        id: 1,
        name: 'Bulan',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockSatuanService.delete.mockResolvedValue(mockSatuan);

      const result = await controller.deleteSatuan(1);

      expect(result).toEqual(mockSatuan);
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
