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

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserState {
  filters: {
    search: string;
    role?: string;
    permission?: string[];
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "ASC" | "DESC";
  };
  isDialogOpen: boolean;
  selectedUser: User | null;
}

export interface UsersActions {
  setSearch: (search: string) => void;
  setRole: (role: string | undefined) => void;
  setPermission: (permission: string[] | undefined) => void;
  setFilters: (filters: Partial<UserState["filters"]>) => void;
  openDialog: (user?: User) => void;
  closeDialog: () => void;
}

export type UsersStore = UserState & UsersActions;

export type { CreateUserInput, UpdateUserInput } from "../schemas/user.schema";
