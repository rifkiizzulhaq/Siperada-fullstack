import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsulanKegiatan } from './entities/usulan-kegiatan.entities';
import { QueryFailedError, Repository } from 'typeorm';
import { SatuanService } from '../satuan/satuan.service';
import {
  CreateUsulanKegiatan,
  searchUsulanKegiatan,
  searchUsulanKegiatanResponse,
  UpdateUsulanKegiatan,
} from '../../common/Interfaces/usulan-kegiatan.interface';
import { KomponenProgramService } from '../komponen_program/komponen_program.service';

@Injectable()
export class UsulanKegiatanService {
  constructor(
    @InjectRepository(UsulanKegiatan)
    private readonly ukRepository: Repository<UsulanKegiatan>,
    private readonly satuanService: SatuanService,
    private readonly kpService: KomponenProgramService,
  ) {}

  findAllUsulanKegiatan = async (): Promise<UsulanKegiatan[]> => {
    return await this.ukRepository.find({
      relations: ['satuan', 'komponen_program', 'komponen_program.kategori'],
    });
  };

  findUsulanKegiatanById = async (id: number): Promise<UsulanKegiatan> => {
    const uk = await this.ukRepository.findOneBy({ id });
    if (!uk) {
      throw new NotFoundException('Usulan kegiatan tidak ditemukan');
    }
    return uk;
  };

  create = async (data: CreateUsulanKegiatan): Promise<UsulanKegiatan> => {
    await this.kpService.findKomponenProgramById(data.komponen_programId);
    await this.satuanService.findSatuanById(data.satuanId);
    const uk = this.ukRepository.create({
      komponen_programId: data.komponen_programId,
      satuanId: data.satuanId,
      volume: data.volume,
      harga_satuan: data.harga_satuan,
      tahun_anggaran: data.tahun_anggaran,
    });

    return await this.ukRepository.save(uk);
  };

  update = async (
    id: number,
    data: UpdateUsulanKegiatan,
  ): Promise<UsulanKegiatan> => {
    if (data.komponen_programId) {
      await this.kpService.findKomponenProgramById(data.komponen_programId);
    }
    if (data.satuanId) {
      await this.satuanService.findSatuanById(data.satuanId);
    }
    await this.ukRepository.update(id, data);
    return await this.findUsulanKegiatanById(id);
  };

  delete = async (id: number): Promise<UsulanKegiatan> => {
    try {
      const uk = await this.findUsulanKegiatanById(id);
      await this.ukRepository.delete(id);
      return uk;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const mysqlError = error.driverError as { code?: string };
        if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2') {
          throw new BadRequestException(
            'tidak dapat dihapus karena masih digunakan oleh data lain',
          );
        }
      }
      throw error;
    }
  };

  searchByParams = async (
    query: searchUsulanKegiatan,
  ): Promise<searchUsulanKegiatanResponse<UsulanKegiatan>> => {
    const qb = this.ukRepository.createQueryBuilder('usulanKegiatan');
    qb.leftJoinAndSelect('usulanKegiatan.komponen_program', 'komponen_program');
    qb.leftJoinAndSelect('usulanKegiatan.satuan', 'satuan');

    if (query.search) {
      const searchNum = Number(query.search);
      if (!isNaN(searchNum)) {
        // Jika input adalah angka, cari exact match
        qb.where(
          '(usulanKegiatan.volume = :num OR usulanKegiatan.harga_satuan = :num OR komponen_program.name LIKE :search OR komponen_program.kode LIKE :search)',
          { num: searchNum, search: `%${query.search}%` },
        );
      } else {
        // Jika input adalah text, cari di text fields
        qb.where(
          '(komponen_program.kode LIKE :search OR komponen_program.name LIKE :search OR satuan.name LIKE :search)',
          { search: `%${query.search}%` },
        );
      }
    }

    const sortBy = query.sortBy || 'id';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`usulanKegiatan.${sortBy}`, sortOrder);

    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };
}
