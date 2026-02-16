import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAkunDetailDto {
  @IsNotEmpty()
  @IsString()
  kode: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
