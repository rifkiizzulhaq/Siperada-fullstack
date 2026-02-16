import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKategoriDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
