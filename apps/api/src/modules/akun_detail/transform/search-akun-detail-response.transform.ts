import { Expose, Type } from 'class-transformer';
import { AkunDetailResponse } from './akun-detail-response.transform';

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

export class SearchAkunDetailResponse {
  @Expose()
  @Type(() => AkunDetailResponse)
  data: AkunDetailResponse[];

  @Expose()
  @Type(() => MetaResponse)
  meta: MetaResponse;
}
