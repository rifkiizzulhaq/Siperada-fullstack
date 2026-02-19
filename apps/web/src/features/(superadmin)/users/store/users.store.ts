import { create } from "zustand";
import { UsersStore } from "../types/users.type";

export const useUsersStore = create<UsersStore>()((set) => ({
  isDialogOpen: false,
  selectedUser: null,
  openDialog: (user) =>
    set({ isDialogOpen: true, selectedUser: user || null }),
  closeDialog: () => set({ isDialogOpen: false }),
}));
