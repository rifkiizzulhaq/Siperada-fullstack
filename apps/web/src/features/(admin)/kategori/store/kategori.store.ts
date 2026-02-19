import { KategoriStore } from "../types/kategori.type";
import { create } from "zustand";

export const useKategoriStore = create<KategoriStore>()((set) => ({
  isDialogOpen: false,
  selectKategori: null,
  openDialog: (kategori) =>
    set({ isDialogOpen: true, selectKategori: kategori || null }),
  closeDialog: () => set({ isDialogOpen: false }),
}));
