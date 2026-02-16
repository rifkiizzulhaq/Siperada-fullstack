import { Expose, Type } from 'class-transformer';
import { UsulanKegiatanResponse } from '../../../modules/usulan_kegiatan/transform/usulan-kegiatan-response.transform';
import { AkunDetailResponse } from '../../../modules/akun_detail/transform/akun-detail-response.transform';
import { SatuanResponse } from '../../../modules/satuan/transform/satuan-response.transform';

export class JudulKegiatanResponse {
  @Expose()
  id: number;

  @Expose()
  judul_kegiatan: string;

  @Expose()
  volume: number;

  @Expose()
  harga_satuan: number;

  @Expose()
  total_biaya: number;

  @Expose()
  @Type(() => UsulanKegiatanResponse)
  usulan_kegiatan: UsulanKegiatanResponse[];

  @Expose()
  @Type(() => AkunDetailResponse)
  akun_detail: AkunDetailResponse[];

  @Expose()
  @Type(() => SatuanResponse)
  satuan: SatuanResponse[];
}
