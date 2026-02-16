export interface CreateAkunDetail {
  kode: string;
  name: string;
}

export interface UpdateAkunDetail {
  kode?: string;
  name?: string;
}

export class searchAkunDetail {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class searchAkunDetailResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
