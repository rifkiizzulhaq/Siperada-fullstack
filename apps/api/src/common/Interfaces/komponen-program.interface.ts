export interface CreateKomponenProgram {
  kategoriId: number;
  kode_parent?: number;
  kode: string;
  name: string;
}

export interface UpdateKomponenProgram {
  kategoriId?: number;
  kode_parent?: number;
  kode?: string;
  name?: string;
}

export class searchKomponenProgram {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class searchKomponenProgramResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
