import { Test, TestingModule } from '@nestjs/testing';
import { JudulKegiatanController } from './judul_kegiatan.controller';
import { JudulKegiatanService } from './judul_kegiatan.service';

describe('JudulKegiatanController', () => {
  let controller: JudulKegiatanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JudulKegiatanController],
      providers: [
        {
          provide: JudulKegiatanService,
          useValue: {
            create: jest.fn(),
            findAllJudulKegiatan: jest.fn(),
            findJudulKegiatanById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            searchByParams: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JudulKegiatanController>(JudulKegiatanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
