import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AkunDetail } from './entities/akun-detail.entities';
import { Repository } from 'typeorm';
import {
  CreateAkunDetail,
  searchAkunDetail,
  searchAkunDetailResponse,
  UpdateAkunDetail,
} from '../../common/Interfaces/akun-detail.interface';

@Injectable()
export class AkunDetailService {
  constructor(
    @InjectRepository(AkunDetail)
    private readonly akundetailRepository: Repository<AkunDetail>,
  ) {}

  findAllAkunDetail = async (): Promise<AkunDetail[]> => {
    return await this.akundetailRepository.find();
  };

  findAkunDetailById = async (id: number): Promise<AkunDetail> => {
    const akunDetail = await this.akundetailRepository.findOneBy({ id });
    if (!akunDetail) throw new NotFoundException('Akun detail tidak ditemukan');
    return akunDetail;
  };

  create = async (data: CreateAkunDetail): Promise<AkunDetail> => {
    const akunDetail = this.akundetailRepository.create({
      kode: data.kode,
      name: data.name,
    });
    await this.akundetailRepository.save(akunDetail);
    return akunDetail;
  };

  update = async (id: number, data: UpdateAkunDetail): Promise<AkunDetail> => {
    await this.akundetailRepository.update(id, data);
    return await this.findAkunDetailById(id);
  };

  delete = async (id: number): Promise<AkunDetail> => {
    const akunDetail = await this.findAkunDetailById(id);
    await this.akundetailRepository.delete(id);
    return akunDetail;
  };

  searchByParams = async (
    query: searchAkunDetail,
  ): Promise<searchAkunDetailResponse<AkunDetail>> => {
    const qb = this.akundetailRepository.createQueryBuilder('AkunDetail');

    if (query.search) {
      qb.where(
        '(AkunDetail.name LIKE :search OR AkunDetail.kode LIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    const sortBy = query.sortBy || 'id';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`AkunDetail.${sortBy}`, sortOrder);

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
