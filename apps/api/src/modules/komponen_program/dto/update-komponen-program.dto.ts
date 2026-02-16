import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateKomponenProgramDto {
  @IsOptional()
  @IsNumber()
  kategoriId?: number;

  @IsOptional()
  @IsNumber()
  kode_parent?: number;

  @IsOptional()
  @IsString()
  kode?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
