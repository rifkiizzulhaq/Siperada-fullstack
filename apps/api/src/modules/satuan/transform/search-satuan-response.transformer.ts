import { Expose, Type } from 'class-transformer';
import { SatuanResponse } from './satuan-response.transform';

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

export class SearchSatuanResponse {
  @Expose()
  @Type(() => SatuanResponse)
  data: SatuanResponse[];

  @Expose()
  @Type(() => MetaResponse)
  meta: MetaResponse;
}
