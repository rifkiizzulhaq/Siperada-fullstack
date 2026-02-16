import { Expose, Type } from 'class-transformer';

export class UnitResponse {
  @Expose()
  id: number;

  @Expose()
  kode_unit: string;

  @Expose()
  nama_unit: string;

  @Expose()
  bidang: string;

  @Expose()
  nip: string;
}

export class AdminResponse {
  @Expose()
  id: number;

  @Expose()
  nip: string;

  @Expose()
  nidn: string;
}

export class PemimpinResponse {
  @Expose()
  id: number;

  @Expose()
  bidang: string;

  @Expose()
  nip: string;

  @Expose()
  nidn: string;
}

export class RoleResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class PermissionResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;

  // @Expose()
  // description: string;
}

export class UserResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => RoleResponse)
  role: RoleResponse;

  @Expose()
  @Type(() => PermissionResponse)
  permissions: PermissionResponse[];

  @Expose()
  @Type(() => AdminResponse)
  admin: AdminResponse;

  @Expose()
  @Type(() => UnitResponse)
  unit: UnitResponse;

  @Expose()
  @Type(() => PemimpinResponse)
  pemimpin: PemimpinResponse;
}
