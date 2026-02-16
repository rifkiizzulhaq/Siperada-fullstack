export interface CreateJudulKegiatan {
  usulan_kegiatanId: number;
  akun_detailId: number;
  satuanId: number;
  judul_kegiatan: string;
  volume: number;
  harga_satuan: number;
  total_biaya: number;
}

export interface UpdateJudulKegiatan {
  usulan_kegiatanId?: number;
  akun_detailId?: number;
  satuanId?: number;
  judul_kegiatan?: string;
  volume?: number;
  harga_satuan?: number;
  total_biaya?: number;
}

export class searchJudulKegiatan {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class searchJudulKegiatanResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
