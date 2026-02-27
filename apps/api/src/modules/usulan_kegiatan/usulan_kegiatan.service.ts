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
    if (data.komponen_programId) {
      await this.kpService.findKomponenProgramById(data.komponen_programId);
    }
    if (data.satuanId) {
      await this.satuanService.findSatuanById(data.satuanId);
    }
    if (data.parentId) {
      await this.findUsulanKegiatanById(data.parentId);
    }
    const uk = this.ukRepository.create({
      komponen_programId: data.komponen_programId,
      satuanId: data.satuanId,
      parentId: data.parentId,
      volume: data.volume ?? 0,
      harga_satuan: data.harga_satuan ?? 0,
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
    const uk = await this.findUsulanKegiatanById(id);

    const childCount = await this.ukRepository.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      throw new BadRequestException(
        `Tidak dapat dihapus karena masih memiliki ${childCount} data turunan. Hapus dari baris paling bawah terlebih dahulu.`,
      );
    }

    try {
      await this.ukRepository.delete(id);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const mysqlError = error.driverError as { code?: string };
        if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2') {
          throw new BadRequestException(
            'Tidak dapat dihapus karena masih digunakan oleh data lain.',
          );
        }
      }
      throw error;
    }

    return uk;
  };

  getDistinctTahunAnggaran = async (): Promise<string[]> => {
    const rows = await this.ukRepository
      .createQueryBuilder('usulanKegiatan')
      .select('DISTINCT usulanKegiatan.tahun_anggaran', 'tahun_anggaran')
      .where('usulanKegiatan.tahun_anggaran IS NOT NULL')
      .orderBy('usulanKegiatan.tahun_anggaran', 'DESC')
      .getRawMany();

    return rows.map((r) => {
      const val = r.tahun_anggaran;
      if (typeof val === 'string') return val.slice(0, 10);
      if (val instanceof Date) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return String(val);
    });
  };

  searchByParams = async (
    query: searchUsulanKegiatan,
  ): Promise<searchUsulanKegiatanResponse<UsulanKegiatan>> => {
    const qb = this.ukRepository.createQueryBuilder('usulanKegiatan');
    qb.leftJoinAndSelect('usulanKegiatan.komponen_program', 'komponen_program');
    qb.leftJoinAndSelect('komponen_program.kategori', 'kategori');
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

    if (query.tahun_anggaran && query.tahun_anggaran !== 'all') {
      const isYearOnly = /^\d{4}$/.test(query.tahun_anggaran);
      if (isYearOnly) {
        qb.andWhere('YEAR(usulanKegiatan.tahun_anggaran) = :tahun', {
          tahun: parseInt(query.tahun_anggaran, 10),
        });
      } else {
        qb.andWhere('usulanKegiatan.tahun_anggaran = :tahun', {
          tahun: query.tahun_anggaran,
        });
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
