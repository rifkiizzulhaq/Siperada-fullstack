import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUsulanKegiatanDto {
  @IsNotEmpty()
  @IsNumber()
  komponen_programId: number;

  @IsNotEmpty()
  @IsNumber()
  satuanId: number;

  @IsNotEmpty()
  @IsNumber()
  volume: number;

  @IsNotEmpty()
  @IsNumber()
  harga_satuan: number;

  @IsNotEmpty()
  @IsString()
  tahun_anggaran: string;
}
