import { KpType } from "@/src/features/(admin)/komponen-program/types/kp.type";
import { Satuan } from "@/src/features/(admin)/satuan/types/satuan.type";

export interface UkType {
  id: number;
  komponen_programId?: number;
  satuanId?: number;
  parentId?: number;
  harga_satuan: number;
  tahun_anggaran: string;   
  volume: number;           
  komponen_program: KpType;
  satuan: Satuan;
}

export interface filter {
  search: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  tahun_anggaran?: string;
}
