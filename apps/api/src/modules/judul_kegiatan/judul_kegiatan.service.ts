import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JudulKegiatan } from './entities/judul-kegiatan.entities';
import { Repository } from 'typeorm';
import { UsulanKegiatanService } from '../usulan_kegiatan/usulan_kegiatan.service';
import { AkunDetailService } from '../akun_detail/akun_detail.service';
import { SatuanService } from '../satuan/satuan.service';
import { CreateJudulKegiatanDto } from './dto/create-judul-kegiatan.dto';
import {
  searchJudulKegiatan,
  searchJudulKegiatanResponse,
  UpdateJudulKegiatan,
} from '../../common/Interfaces/judul-kegiatan.interface';

@Injectable()
export class JudulKegiatanService {
  constructor(
    @InjectRepository(JudulKegiatan)
    private readonly jkRepository: Repository<JudulKegiatan>,
    private readonly ukService: UsulanKegiatanService,
    private readonly adService: AkunDetailService,
    private readonly satuanService: SatuanService,
  ) {}

  findAllJudulKegiatan = async (): Promise<JudulKegiatan[]> => {
    return await this.jkRepository.find({
      relations: [
        'usulan_kegiatan',
        'akun_detail',
        'satuan',
        'usulan_kegiatan.komponen_program',
        'usulan_kegiatan.satuan',
      ],
    });
  };

  findJudulKegiatanById = async (id: number): Promise<JudulKegiatan> => {
    const jk = await this.jkRepository.findOneBy({ id });
    if (!jk) throw new NotFoundException('Judul kegiatan tidak ditemukan');
    return jk;
  };

  create = async (data: CreateJudulKegiatanDto): Promise<JudulKegiatan> => {
    await this.ukService.findUsulanKegiatanById(data.usulan_kegiatanId);
    await this.adService.findAkunDetailById(data.akun_detailId);
    await this.satuanService.findSatuanById(data.satuanId);
    const jk = this.jkRepository.create({
      usulan_kegiatanId: data.usulan_kegiatanId,
      akun_detailId: data.akun_detailId,
      satuanId: data.satuanId,
      judul_kegiatan: data.judul_kegiatan,
      volume: data.volume,
      harga_satuan: data.harga_satuan,
      total_biaya: data.total_biaya,
    });

    await this.jkRepository.save(jk);
    return jk;
  };

  update = async (
    id: number,
    data: UpdateJudulKegiatan,
  ): Promise<JudulKegiatan> => {
    if (data.usulan_kegiatanId) {
      await this.ukService.findUsulanKegiatanById(data.usulan_kegiatanId);
    }

    if (data.akun_detailId) {
      await this.adService.findAkunDetailById(data.akun_detailId);
    }

    if (data.satuanId) {
      await this.satuanService.findSatuanById(data.satuanId);
    }

    await this.jkRepository.update(id, data);
    return await this.findJudulKegiatanById(id);
  };

  delete = async (id: number): Promise<JudulKegiatan> => {
    const kp = await this.findJudulKegiatanById(id);
    await this.jkRepository.delete(id);
    return kp;
  };

  searchByParams = async (
    query: searchJudulKegiatan,
  ): Promise<searchJudulKegiatanResponse<JudulKegiatan>> => {
    const qb = this.jkRepository.createQueryBuilder('judulKegiatan');
    qb.leftJoinAndSelect('komponen_program.kategori', 'kategori');
    qb.leftJoinAndSelect('judulKegiatan.akun_detail', 'akun_detail');
    qb.leftJoinAndSelect('judulKegiatan.satuan', 'satuan');

    if (query.search) {
      const searchNum = Number(query.search);
      if (!isNaN(searchNum)) {
        // Jika input adalah angka, cari exact match
        qb.where(
          '(judulKegiatan.volume = :num OR judulKegiatan.harga_satuan = :num OR judulKegiatan.total_biaya = :num OR komponen_program.kode LIKE :search OR satuan.name LIKE :search OR akun_detail.kode LIKE :search)',
          { num: searchNum, search: `%${query.search}%` },
        );
      } else {
        // Jika input adalah text, cari di text fields
        qb.where(
          '(judulKegiatan.judul_kegiatan LIKE :search OR komponen_program.kode LIKE :search OR satuan.name LIKE :search OR akun_detail.kode LIKE :search)',
          { search: `%${query.search}%` },
        );
      }
    }

    const sortBy = query.sortBy || 'id';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`judulKegiatan.${sortBy}`, sortOrder);

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
