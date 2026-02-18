import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UsersStore } from "../types/users.type";

export const useUsersStore = create<UsersStore>()(
  persist(
    (set) => ({
      filters: {
        search: "",
        role: undefined,
        permission: undefined,
        page: 1,
        limit: 5,
        sortBy: "id",
        sortOrder: "DESC",
      },
      isDialogOpen: false,
      selectedUser: null,
      setSearch: (search) =>
        set((state) => ({ filters: { ...state.filters, search, page: 1 } })),
      setRole: (role) =>
        set((state) => ({ filters: { ...state.filters, role, page: 1 } })),
      setPermission: (permission) =>
        set((state) => ({
          filters: { ...state.filters, permission, page: 1 },
        })),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      openDialog: (user) =>
        set({ isDialogOpen: true, selectedUser: user || null }),
      closeDialog: () => set({ isDialogOpen: false }),
    }),
    {
      name: "users-storage",
      partialize: (state) => ({
        filters: {
          ...state.filters,
          search: "",
          role: undefined,
          permission: undefined,
          page: 1,
        },
      }),
    },
  ),
);
