import axiosInstance from "@/src/lib/axios";
import { filterType, Satuan } from "../types/satuan.type";
import { Meta } from "@/src/types/search-global.type";

export const getAllSatuan = async (): Promise<Satuan[]> => {
  const { data } = await axiosInstance.get<{ data: Satuan[] }>("/satuan");
  return data.data;
};

export const create = async (body: Satuan): Promise<Satuan> => {
  const { data } = await axiosInstance.post<{ data: Satuan }>("/satuan", body);
  return data.data;
};

export const update = async (id: number, body: Satuan): Promise<Satuan> => {
  const { data } = await axiosInstance.patch<{ data: Satuan }>(`/satuan/${id}`, body);
  return data.data;
};

export const deletes = async (id: number): Promise<Satuan> => {
  const { data } = await axiosInstance.delete<{ data: Satuan }>(`/satuan/${id}`);
  return data.data;
};

export const Search = async (
  filter: Partial<filterType>,
): Promise<{ data: Satuan[]; meta: Meta }> => {
  const res = await axiosInstance.get<{ data: { data: Satuan[]; meta: Meta } }>(
    "/satuan/search",
    { params: filter },
  );
  return res.data.data;
};
