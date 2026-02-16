import { Test, TestingModule } from '@nestjs/testing';
import { KomponenProgramController } from './komponen_program.controller';
import { KomponenProgramService } from './komponen_program.service';

describe('KomponenProgramController', () => {
  let controller: KomponenProgramController;
  let service: KomponenProgramService;

  const mockKpService = {
    findAllKomponenProgram: jest.fn(),
    findKomponenProgramById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    searchByParams: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KomponenProgramController],
      providers: [
        {
          provide: KomponenProgramService,
          useValue: mockKpService,
        },
      ],
    }).compile();

    controller = module.get<KomponenProgramController>(
      KomponenProgramController,
    );
    service = module.get<KomponenProgramService>(KomponenProgramService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all komponen program with kategori', async () => {
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

      mockKpService.findAllKomponenProgram.mockResolvedValue(mockData);

      const result = await controller.findAll();

      expect(result).toEqual(mockData);
      expect(service.findAllKomponenProgram).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchKomponenProgram', () => {
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
            kategoriId: 1,
            kode_parent: undefined,
            kode: '023.18.DL',
            name: 'Program pendidikan',
            kategori: { id: 1, name: 'Program' },
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

      mockKpService.searchByParams.mockResolvedValue(mockResponse);

      const result = await controller.searchKomponenProgram(query);

      expect(result).toEqual(mockResponse);
      expect(service.searchByParams).toHaveBeenCalledWith(query);
    });
  });

  describe('createKomponenProgram', () => {
    it('should create and return a new komponen program', async () => {
      const createData = {
        kategoriId: 1,
        kode_parent: undefined,
        kode: '023.18.DL',
        name: 'Program pendidikan',
      };

      const mockKp = {
        id: 1,
        ...createData,
        createAt: new Date(),
        updateAt: new Date(),
      };

      mockKpService.create.mockResolvedValue(mockKp);

      const result = await controller.createKomponenProgram(createData);

      expect(result).toEqual(mockKp);
      expect(service.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateKomponenProgram', () => {
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

      mockKpService.update.mockResolvedValue(mockKp);

      const result = await controller.updateKomponenProgram(1, updateData);

      expect(result).toEqual(mockKp);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteKomponenProgram', () => {
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

      mockKpService.delete.mockResolvedValue(mockKp);

      const result = await controller.deleteKomponenProgram(1);

      expect(result).toEqual(mockKp);
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
