import { Test, TestingModule } from '@nestjs/testing';
import { UsulanKegiatanController } from './usulan_kegiatan.controller';
import { UsulanKegiatanService } from './usulan_kegiatan.service';

describe('UsulanKegiatanController', () => {
  let controller: UsulanKegiatanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsulanKegiatanController],
      providers: [
        {
          provide: UsulanKegiatanService,
          useValue: {
            create: jest.fn(),
            findAllUsulanKegiatan: jest.fn(),
            findUsulanKegiatanById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            searchByParams: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsulanKegiatanController>(UsulanKegiatanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
