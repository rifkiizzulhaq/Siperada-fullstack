import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateKomponenProgramDto {
  @IsNotEmpty()
  @IsNumber()
  kategoriId: number;

  @IsOptional()
  @IsNumber()
  kode_parent?: number;

  @IsNotEmpty()
  @IsString()
  kode: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
