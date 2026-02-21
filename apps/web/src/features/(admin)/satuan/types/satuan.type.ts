export interface Satuan {
  id?: number;
  name: string;
}

export interface filterType {
  search: string;
  page: number;
  limit: number;
  sortOrder: "ASC" | "DESC";
  sortBy: string;
}

export interface SatuanState {
  isDialogOpen: boolean;
  selectSatuan: Satuan | null;
}

export interface SatuanActions {
  openDialog: (satuan?: Satuan) => void;
  closeDialog: () => void;
}

export type SatuanStore = SatuanState & SatuanActions;
