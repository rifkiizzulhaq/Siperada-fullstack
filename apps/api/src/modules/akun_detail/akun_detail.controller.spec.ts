import { Test, TestingModule } from '@nestjs/testing';
import { AkunDetailController } from './akun_detail.controller';
import { AkunDetailService } from './akun_detail.service';

describe('AkunDetailController', () => {
  let controller: AkunDetailController;
  let service: AkunDetailService;

  const mockAkunDetailService = {
    findAllAkunDetail: jest.fn(),
    findAkunDetailById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    searchByParams: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AkunDetailController],
      providers: [
        {
          provide: AkunDetailService,
          useValue: mockAkunDetailService,
        },
      ],
    }).compile();

    controller = module.get<AkunDetailController>(AkunDetailController);
    service = module.get<AkunDetailService>(AkunDetailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
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

      mockAkunDetailService.findAllAkunDetail.mockResolvedValue(
        mockAkunDetails,
      );

      const result = await controller.findAll();

      expect(result).toEqual(mockAkunDetails);
      expect(service.findAllAkunDetail).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchAkunDetail', () => {
    it('should return paginated search results', async () => {
      const query = {
        search: 'Honor',
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'DESC' as const,
      };

      const mockResponse = {
        data: [
          {
            id: 1,
            kode: '52115',
            name: 'Belanja Honor',
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

      mockAkunDetailService.searchByParams.mockResolvedValue(mockResponse);

      const result = await controller.searchAkunDetail(query);

      expect(result).toEqual(mockResponse);
      expect(service.searchByParams).toHaveBeenCalledWith(query);
    });
  });

  describe('createAkunDetail', () => {
    it('should create and return a new akun detail', async () => {
      const createData = { kode: '52115', name: 'Belanja Honor' };
      const mockAkunDetail = {
        id: 1,
        kode: '52115',
        name: 'Belanja Honor',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockAkunDetailService.create.mockResolvedValue(mockAkunDetail);

      const result = await controller.createAkunDetail(createData);

      expect(result).toEqual(mockAkunDetail);
      expect(service.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateAkunDetail', () => {
    it('should update and return the akun detail', async () => {
      const updateData = { name: 'Updated Belanja Honor' };
      const mockAkunDetail = {
        id: 1,
        kode: '52115',
        name: 'Updated Belanja Honor',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockAkunDetailService.update.mockResolvedValue(mockAkunDetail);

      const result = await controller.updateAkunDetail(1, updateData);

      expect(result).toEqual(mockAkunDetail);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteAkunDetail', () => {
    it('should delete and return the akun detail', async () => {
      const mockAkunDetail = {
        id: 1,
        kode: '52115',
        name: 'Belanja Honor',
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockAkunDetailService.delete.mockResolvedValue(mockAkunDetail);

      const result = await controller.deleteAkunDetail(1);

      expect(result).toEqual(mockAkunDetail);
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
