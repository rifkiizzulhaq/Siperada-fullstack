import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KomponenProgram } from './entities/komponen-program.entities';
import { Repository } from 'typeorm';
import { KategoriService } from '../kategori/kategori.service';
import {
  CreateKomponenProgram,
  searchKomponenProgram,
  searchKomponenProgramResponse,
  UpdateKomponenProgram,
} from '../../common/Interfaces/komponen-program.interface';

@Injectable()
export class KomponenProgramService {
  constructor(
    @InjectRepository(KomponenProgram)
    private readonly kpRepository: Repository<KomponenProgram>,
    private readonly kategoriRepository: KategoriService,
  ) {}

  findAllKomponenProgram = async (): Promise<KomponenProgram[]> => {
    return await this.kpRepository.find({
      relations: ['kategori'],
    });
  };

  findKomponenProgramById = async (id: number): Promise<KomponenProgram> => {
    const kp = await this.kpRepository.findOne({
      where: { id },
      relations: ['kategori'],
    });
    if (!kp) {
      throw new NotFoundException('Komponen Program tidak ditemukan');
    }
    return kp;
  };

  create = async (data: CreateKomponenProgram): Promise<KomponenProgram> => {
    await this.kategoriRepository.findKategoriById(data.kategoriId);

    const kp = this.kpRepository.create({
      kategoriId: data.kategoriId,
      kode_parent: data.kode_parent,
      kode: data.kode,
      name: data.name,
    });

    await this.kpRepository.save(kp);
    return kp;
  };

  update = async (
    id: number,
    data: UpdateKomponenProgram,
  ): Promise<KomponenProgram> => {
    if (data.kategoriId) {
      await this.kategoriRepository.findKategoriById(data.kategoriId);
    }
    await this.kpRepository.update(id, data);
    return await this.findKomponenProgramById(id);
  };

  delete = async (id: number): Promise<KomponenProgram> => {
    const kp = await this.findKomponenProgramById(id);
    await this.kpRepository.delete(id);
    return kp;
  };

  searchByParams = async (
    query: searchKomponenProgram,
  ): Promise<searchKomponenProgramResponse<KomponenProgram>> => {
    const qb = this.kpRepository.createQueryBuilder('kp');

    qb.leftJoinAndSelect('kp.kategori', 'kategori');

    if (query.search) {
      qb.where('(kp.name LIKE :search OR kp.kode LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const sortBy = query.sortBy || 'id';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`kp.${sortBy}`, sortOrder);

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
