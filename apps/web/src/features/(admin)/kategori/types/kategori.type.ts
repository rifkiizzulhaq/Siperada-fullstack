import { Meta } from "@/src/types/search-global.type";

export interface Kategori {
  id?: number;
  name: string;
}

export interface filter {
  search: string;
  page: number;
  limit: number;
  sortOrder: "ASC" | "DESC";
  sortBy: string;
}

export interface KategoriFormProps {
  id?: number;
  mode: "add" | "edit";
}

export interface KategoriState {
  isDialogOpen: boolean;
  selectKategori: Kategori | null;
}

export interface KategoriActions {
  openDialog: (kategori?: Kategori) => void;
  closeDialog: () => void;
}

export type KategoriStore = KategoriState & KategoriActions

export interface KategoriResponse {
  data: Kategori[];
  meta: Meta;
}

