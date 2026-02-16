import { Test, TestingModule } from '@nestjs/testing';
import { JudulKegiatanService } from './judul_kegiatan.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JudulKegiatan } from './entities/judul-kegiatan.entities';
import { UsulanKegiatanService } from '../usulan_kegiatan/usulan_kegiatan.service';
import { AkunDetailService } from '../akun_detail/akun_detail.service';
import { SatuanService } from '../satuan/satuan.service';

describe('JudulKegiatanService', () => {
  let service: JudulKegiatanService;

  const mockJudulKegiatanRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  const mockUsulanKegiatanService = {
    findUsulanKegiatanById: jest.fn(),
  };

  const mockAkunDetailService = {
    findAkunDetailById: jest.fn(),
  };

  const mockSatuanService = {
    findSatuanById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JudulKegiatanService,
        {
          provide: getRepositoryToken(JudulKegiatan),
          useValue: mockJudulKegiatanRepository,
        },
        {
          provide: UsulanKegiatanService,
          useValue: mockUsulanKegiatanService,
        },
        {
          provide: AkunDetailService,
          useValue: mockAkunDetailService,
        },
        {
          provide: SatuanService,
          useValue: mockSatuanService,
        },
      ],
    }).compile();

    service = module.get<JudulKegiatanService>(JudulKegiatanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
