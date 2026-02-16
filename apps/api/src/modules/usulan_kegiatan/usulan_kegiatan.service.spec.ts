import { Test, TestingModule } from '@nestjs/testing';
import { UsulanKegiatanService } from './usulan_kegiatan.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsulanKegiatan } from './entities/usulan-kegiatan.entities';
import { SatuanService } from '../satuan/satuan.service';
import { KomponenProgramService } from '../komponen_program/komponen_program.service';

describe('UsulanKegiatanService', () => {
  let service: UsulanKegiatanService;

  const mockUsulanKegiatanRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSatuanService = {
    findSatuanById: jest.fn(),
  };

  const mockKomponenProgramService = {
    findKomponenProgramById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsulanKegiatanService,
        {
          provide: getRepositoryToken(UsulanKegiatan),
          useValue: mockUsulanKegiatanRepository,
        },
        {
          provide: SatuanService,
          useValue: mockSatuanService,
        },
        {
          provide: KomponenProgramService,
          useValue: mockKomponenProgramService,
        },
      ],
    }).compile();

    service = module.get<UsulanKegiatanService>(UsulanKegiatanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
