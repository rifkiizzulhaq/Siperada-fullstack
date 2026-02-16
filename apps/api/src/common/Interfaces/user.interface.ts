export interface CreateUser {
  roleId: number;
  name: string;
  email: string;
  password: string;
  permissionsId: number[];
  nama_unit?: string;
  kode_unit?: string;
  bidang?: string;
  nip?: string;
  nidn?: string;
}

export interface UpdateUser {
  roleId?: number;
  name?: string;
  email?: string;
  password?: string;
  permissionsId?: number[];
  nama_unit?: string;
  kode_unit?: string;
  bidang?: string;
  nip?: string;
  nidn?: string;
}

export class searchUsers {
  search?: string;
  role?: string;
  permission?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class searchUsersResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
