import { SatuanStore } from "../types/satuan.type";
import { create } from "zustand";

export const useSatuanStore = create<SatuanStore>()((set) => ({
  isDialogOpen: false,
  selectSatuan: null,
  openDialog: (satuan) =>
    set({ isDialogOpen: true, selectSatuan: satuan || null }),
  closeDialog: () => set({ isDialogOpen: false }),
}));
