export interface CreateSatuan {
  name: string;
}

export interface UpdateSatuan {
  name?: string;
}

export class searchSatuan {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class searchSatuanResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
