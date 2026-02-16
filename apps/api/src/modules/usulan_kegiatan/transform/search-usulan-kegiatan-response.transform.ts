import { Expose, Type } from 'class-transformer';
import { UsulanKegiatanResponse } from './usulan-kegiatan-response.transform';

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

export class SearchUsulanKegiatanResponse {
  @Expose()
  @Type(() => UsulanKegiatanResponse)
  data: UsulanKegiatanResponse[];

  @Expose()
  @Type(() => MetaResponse)
  meta: MetaResponse;
}
