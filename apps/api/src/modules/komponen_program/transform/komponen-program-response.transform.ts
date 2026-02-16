import { Expose, Type } from 'class-transformer';
import { KategoriResponse } from '../../kategori/transform/kategori-response.transform';

export class KomponenProgramResponse {
  @Expose()
  id: number;

  @Expose()
  kode_parent: number;

  @Expose()
  kode: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => KategoriResponse)
  kategori: KategoriResponse;
}
