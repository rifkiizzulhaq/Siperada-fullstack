import axiosInstance from "@/src/lib/axios";
import { filter, KpType } from "../types/kp.type";
import { Meta } from "@/src/types/search-global.type";
import { Kategori } from "../../kategori/types/kategori.type";

export const create = async (body: KpType): Promise<KpType> => {
  const { data: res } = await axiosInstance.post<{ data: KpType }>("/komponen-program", body);
  return res.data;
};

export const getAllKp = async (): Promise<KpType[]> => {
  const { data: res } = await axiosInstance.get<{ data: KpType[] }>("/komponen-program");
  return res.data;
};

export const update = async (id: number, body: KpType): Promise<KpType> => {
  const { data: res } = await axiosInstance.patch<{ data: KpType }>(`/komponen-program/${id}`, body);
  return res.data;
};

export const deletes = async (id: number): Promise<KpType> => {
  const { data: res } = await axiosInstance.delete<{ data: KpType }>(`/komponen-program/${id}`);
  return res.data;
};

export const getKategori = async (): Promise<Kategori[]> => {
  const { data: res } = await axiosInstance.get<{ data: Kategori[] }>("/kategori");
  return res.data;
};

export const searchKp = async (
  filters: Partial<filter>,
): Promise<{ data: KpType[]; meta: Meta }> => {
  const { data: res } = await axiosInstance.get<{
    data: { data: KpType[]; meta: Meta };
  }>("/komponen-program/search", { params: filters });
  return res.data;
};
