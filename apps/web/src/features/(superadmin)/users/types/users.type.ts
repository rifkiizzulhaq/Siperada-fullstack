export interface User {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string };
  permissions: { id: number, name: string }[];
  unit?: {
    id: number;
    kode_unit: string;
    nama_unit: string;
    bidang: string;
    nip: string;
  };
  admin?: {
    id: number;
    nip: string;
    nidn: string;
  };
  pemimpin?: {
    id: number;
    bidang: string;
    nip: string;
    nidn: string;
  };
}

export interface UserFormProps {
  mode: "add" | "edit";
  id?: number;
}

export interface UserState {
  isDialogOpen: boolean;
  selectedUser: User | null;
}

export interface UsersActions {
  openDialog: (user?: User) => void;
  closeDialog: () => void;
}

export interface UserTableFilters {
  search: string;
  role?: string;
  permission?: string[];
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
}

export type UsersStore = UserState & UsersActions;
