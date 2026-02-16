export interface CreateUsulanKegiatan {
  komponen_programId: number;
  satuanId: number;
  volume: number;
  harga_satuan: number;
  tahun_anggaran: string;
}

export interface UpdateUsulanKegiatan {
  komponen_programId?: number;
  satuanId?: number;
  volume?: number;
  harga_satuan?: number;
  tahun_anggaran?: string;
}

export class searchUsulanKegiatan {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class searchUsulanKegiatanResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
