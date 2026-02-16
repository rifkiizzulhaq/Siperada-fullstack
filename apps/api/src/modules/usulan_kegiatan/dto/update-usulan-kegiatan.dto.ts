import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUsulanKegiatanDto {
  @IsOptional()
  @IsNumber()
  komponen_programId?: number;

  @IsOptional()
  @IsNumber()
  satuanId?: number;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsNumber()
  harga_satuan?: number;

  @IsOptional()
  @IsString()
  tahun_anggaran?: string;
}
