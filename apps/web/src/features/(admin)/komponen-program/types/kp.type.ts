export interface KpType {
  id?: number;
  kategoriId: number;
  kategori?: { id?: number; name: string };
  kode_parent?: number | null;
  kode: string;
  name: string;
}

export interface filter {
  search: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}
