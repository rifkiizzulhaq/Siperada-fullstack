import { AkunDetailStore } from "../types/akun-detail.type";
import { create } from "zustand";

export const useAkunDetailStore = create<AkunDetailStore>()((set) => ({
  isDialogOpen: false,
  selectedAkunDetail: null,
  openDialog: (akunDetail) =>
    set({ isDialogOpen: true, selectedAkunDetail: akunDetail || null }),
  closeDialog: () => set({ isDialogOpen: false }),
}));
