import { Expose, Type } from 'class-transformer';
import { JudulKegiatanResponse } from './judul-kegiatan-response.transform';

class MetaResponse {
  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;
}

export class SearchJudulKegiatanlResponse {
  @Expose()
  @Type(() => JudulKegiatanResponse)
  data: JudulKegiatanResponse[];

  @Expose()
  @Type(() => MetaResponse)
  meta: MetaResponse;
}
