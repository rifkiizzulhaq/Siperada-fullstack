import axiosInstance from "@/src/lib/axios";
import { filter, Kategori, KategoriResponse } from "../types/kategori.type";
import { Meta } from "@/src/types/search-global.type";

export const create = async (body: Kategori): Promise<Kategori> => {
  const { data } = await axiosInstance.post<Kategori>("/kategori", body);
  return data;
};

export const update = async (id: number, body: Kategori): Promise<Kategori> => {
  const { data } = await axiosInstance.patch(`/kategori/${id}`, body);
  return data;
};

export const deletes = async (id: number): Promise<Kategori> => {
  const { data } = await axiosInstance.delete(`/kategori/${id}`);
  return data;
};

export const getAllKategori = async (): Promise<Kategori[]> => {
  const { data } = await axiosInstance.get<{ data: Kategori[] }>("/kategori");
  return data.data;
};

export const searchKategori = async (
  filter?: Partial<filter>,
): Promise<KategoriResponse> => {
  const { data } = await axiosInstance.get<{
    data: KategoriResponse;
  }>("/kategori/search", { params: filter });
  return data.data;
};
