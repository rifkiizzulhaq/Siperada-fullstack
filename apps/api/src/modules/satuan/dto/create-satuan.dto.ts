import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSatuanDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
