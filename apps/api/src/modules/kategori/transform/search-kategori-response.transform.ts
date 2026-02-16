import { Expose, Type } from 'class-transformer';
import { KategoriResponse } from './kategori-response.transform';

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

export class SearchKategoriResponse {
  @Expose()
  @Type(() => KategoriResponse)
  data: KategoriResponse[];

  @Expose()
  @Type(() => MetaResponse)
  meta: MetaResponse;
}
