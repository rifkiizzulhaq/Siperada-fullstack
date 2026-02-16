import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    {
      message:
        'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&#)',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsNumber()
  roleId: number;

  @IsNotEmpty()
  @Type(() => Array)
  permissionsId: number[];

  @IsOptional()
  @IsString()
  bidang?: string;

  @IsOptional()
  @IsString()
  nama_unit?: string;

  @IsOptional()
  @IsString()
  kode_unit?: string;

  @IsOptional()
  @IsString()
  @Length(18, 18, { message: 'NIP harus 18 digit' })
  @Matches(/^\d+$/, { message: 'NIP harus berupa angka' })
  nip?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10, { message: 'NIDN harus 10 digit' })
  @Matches(/^\d+$/, { message: 'NIDN harus berupa angka' })
  nidn?: string;
}
