import { Meta } from "@/src/types/search-global.type";

export interface AkunDetailType {
  id?: number;
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

export interface AkunDetailState {
  isDialogOpen: boolean;
  selectedAkunDetail: AkunDetailType | null;
}

export interface AkunDetailActions {
  openDialog: (akunDetail?: AkunDetailType) => void;
  closeDialog: () => void;
}

export type AkunDetailStore = AkunDetailState & AkunDetailActions;

export interface AkunDetailResponseType {
  data: AkunDetailType[];
  meta: Meta;
}
