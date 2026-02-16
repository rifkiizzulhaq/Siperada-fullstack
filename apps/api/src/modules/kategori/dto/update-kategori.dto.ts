import { IsOptional, IsString } from 'class-validator';

export class UpdateKategoriDto {
  @IsOptional()
  @IsString()
  name: string;
}
