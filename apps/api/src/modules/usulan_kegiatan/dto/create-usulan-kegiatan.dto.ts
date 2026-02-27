import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUsulanKegiatanDto {
  @IsOptional()
  @IsNumber()
  komponen_programId?: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsNumber()
  satuanId?: number;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsNumber()
  harga_satuan?: number;

  @IsNotEmpty()
  @IsString()
  tahun_anggaran: string;
}
