import axiosInstance from "@/src/lib/axios";
import { AkunDetailType, filter } from "../types/akun-detail.type";
import { Meta } from "@/src/types/search-global.type";

export const create = async (data: AkunDetailType): Promise<AkunDetailType> => {
  const { data: res } = await axiosInstance.post<{ data: AkunDetailType }>("/akun-detail", data);
  return res.data;
};

export const update = async (id: number, data: AkunDetailType): Promise<AkunDetailType> => {
  const { data: res } = await axiosInstance.patch<{ data: AkunDetailType }>(`/akun-detail/${id}`, data);
  return res.data;
};

export const deletes = async (id: number): Promise<AkunDetailType> => {
  const { data: res } = await axiosInstance.delete<{ data: AkunDetailType }>(`/akun-detail/${id}`);
  return res.data;
};

export const SearchAkunDetail = async (
  filters: Partial<filter>,
): Promise<{ data: AkunDetailType[]; meta: Meta }> => {
  const { data: res } = await axiosInstance.get<{
    data: { data: AkunDetailType[]; meta: Meta };
  }>(`/akun-detail/search`, { params: filters });
  return res.data;
};
