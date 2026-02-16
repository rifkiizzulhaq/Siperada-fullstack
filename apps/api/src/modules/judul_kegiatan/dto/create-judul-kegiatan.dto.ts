import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateJudulKegiatanDto {
  @IsNotEmpty()
  @IsNumber()
  usulan_kegiatanId: number;

  @IsNotEmpty()
  @IsNumber()
  akun_detailId: number;

  @IsNotEmpty()
  @IsNumber()
  satuanId: number;

  @IsNotEmpty()
  @IsString()
  judul_kegiatan: string;

  @IsNotEmpty()
  @IsNumber()
  volume: number;

  @IsNotEmpty()
  @IsNumber()
  harga_satuan: number;

  @IsNotEmpty()
  @IsNumber()
  total_biaya: number;
}
