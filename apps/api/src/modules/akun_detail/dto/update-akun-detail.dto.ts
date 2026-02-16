import { IsOptional, IsString } from 'class-validator';

export class UpdateAkunDetailDto {
  @IsOptional()
  @IsString()
  kode?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
