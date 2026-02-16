export interface CreateKategori {
  name: string;
}

export interface UpdateKategori {
  name?: string;
}

export class searchKategori {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class searchKategoriResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
