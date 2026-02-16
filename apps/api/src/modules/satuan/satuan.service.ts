import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Satuan } from './entities/satuan.entities';
import { QueryFailedError, Repository } from 'typeorm';
import {
  CreateSatuan,
  searchSatuan,
  searchSatuanResponse,
  UpdateSatuan,
} from '../../common/Interfaces/satuan.interface';

@Injectable()
export class SatuanService {
  constructor(
    @InjectRepository(Satuan)
    private readonly satuanRepository: Repository<Satuan>,
  ) {}

  findAllSatuan = async (): Promise<Satuan[]> => {
    return await this.satuanRepository.find();
  };

  findSatuanById = async (id: number): Promise<Satuan> => {
    const satuan = await this.satuanRepository.findOneBy({ id });
    if (!satuan) {
      throw new NotFoundException('Satuan tidak ditemukan');
    }

    return satuan;
  };

  create = async (data: CreateSatuan): Promise<Satuan> => {
    const satuan = this.satuanRepository.create({
      name: data.name,
    });

    return await this.satuanRepository.save(satuan);
  };

  update = async (id: number, data: UpdateSatuan): Promise<Satuan> => {
    await this.satuanRepository.update(id, data);
    return await this.findSatuanById(id);
  };

  delete = async (id: number): Promise<Satuan> => {
    try {
      const satuan = await this.findSatuanById(id);
      await this.satuanRepository.delete(id);
      return satuan;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const mysqlError = error.driverError as { code?: string };
        if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2') {
          throw new BadRequestException(
            'satuan tidak dapat dihapus karena masih digunakan oleh data lain',
          );
        }
      }
      throw error;
    }
  };

  searchByParams = async (
    query: searchSatuan,
  ): Promise<searchSatuanResponse<Satuan>> => {
    const qb = this.satuanRepository.createQueryBuilder('satuan');

    if (query.search) {
      qb.where('(satuan.name LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const sortBy = query.sortBy || 'id';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`satuan.${sortBy}`, sortOrder);

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
