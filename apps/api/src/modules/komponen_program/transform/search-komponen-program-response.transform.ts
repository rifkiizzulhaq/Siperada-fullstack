import { Expose, Type } from 'class-transformer';
import { KomponenProgramResponse } from './komponen-program-response.transform';

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

export class SearchKomponenProgramResponse {
  @Expose()
  @Type(() => KomponenProgramResponse)
  data: KomponenProgramResponse[];

  @Expose()
  @Type(() => MetaResponse)
  meta: MetaResponse;
}
