import { Expose, Type } from 'class-transformer';
import { SatuanResponse } from '../../satuan/transform/satuan-response.transform';
import { KomponenProgramResponse } from '../../komponen_program/transform/komponen-program-response.transform';

export class UsulanKegiatanResponse {
  @Expose()
  id: number;

  @Expose()
  volume: number;

  @Expose()
  harga_satuan: number;

  @Expose()
  tahun_anggaran: string;

  @Expose()
  @Type(() => KomponenProgramResponse)
  komponen_program: KomponenProgramResponse;

  @Expose()
  @Type(() => SatuanResponse)
  satuan: SatuanResponse;
}
