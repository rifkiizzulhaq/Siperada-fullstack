import { IsOptional, IsString } from 'class-validator';

export class UpdateSatuanDto {
  @IsOptional()
  @IsString()
  name?: string;
}
