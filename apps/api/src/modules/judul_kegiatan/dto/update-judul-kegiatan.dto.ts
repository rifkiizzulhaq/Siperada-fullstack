import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateJudulKegiatanDto {
  @IsOptional()
  @IsNumber()
  usulan_kegiatanId: number;

  @IsOptional()
  @IsNumber()
  akun_detailId: number;

  @IsOptional()
  @IsNumber()
  satuanId: number;

  @IsOptional()
  @IsString()
  judul_kegiatan: string;

  @IsOptional()
  @IsNumber()
  volume: number;

  @IsOptional()
  @IsNumber()
  harga_satuan: number;

  @IsOptional()
  @IsNumber()
  total_biaya: number;
}
