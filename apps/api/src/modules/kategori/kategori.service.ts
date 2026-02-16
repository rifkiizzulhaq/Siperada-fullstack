import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kategori } from './entities/kategori.entities';
import { QueryFailedError, Repository } from 'typeorm';
import {
  CreateKategori,
  searchKategori,
  searchKategoriResponse,
} from '../../common/Interfaces/kategori.interface';
import { UpdateKategori } from '../../common/Interfaces/kategori.interface';

@Injectable()
export class KategoriService {
  constructor(
    @InjectRepository(Kategori)
    private readonly kategoriRepository: Repository<Kategori>,
  ) {}

  findAllKategori = async (): Promise<Kategori[]> => {
    return await this.kategoriRepository.find();
  };

  findKategoriById = async (id: number): Promise<Kategori | void> => {
    const kategori = await this.kategoriRepository.findOneBy({ id });
    if (!kategori) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    return kategori;
  };

  create = async (data: CreateKategori): Promise<Kategori> => {
    const kategori = this.kategoriRepository.create({
      name: data.name,
    });

    return await this.kategoriRepository.save(kategori);
  };

  update = async (
    id: number,
    data: UpdateKategori,
  ): Promise<Kategori | void> => {
    await this.kategoriRepository.update(id, data);
    return await this.findKategoriById(id);
  };

  delete = async (id: number): Promise<Kategori | void> => {
    const kategori = await this.findKategoriById(id);

    try {
      await this.kategoriRepository.delete(id);
      return kategori;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const mysqlError = error.driverError as { code?: string };
        if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2') {
          throw new BadRequestException(
            'Kategori tidak dapat dihapus karena masih digunakan oleh data lain',
          );
        }
      }
      throw error;
    }
  };

  searchByParams = async (
    query: searchKategori,
  ): Promise<searchKategoriResponse<Kategori>> => {
    const qb = this.kategoriRepository.createQueryBuilder('kategori');

    if (query.search) {
      qb.where('(kategori.name LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const sortBy = query.sortBy || 'id';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`kategori.${sortBy}`, sortOrder);

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
