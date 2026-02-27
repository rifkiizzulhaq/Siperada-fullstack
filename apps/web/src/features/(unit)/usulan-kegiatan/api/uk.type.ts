import axiosInstance from "@/src/lib/axios";
import { filter, UkType } from "../types/uk.type";
import { Meta } from "@/src/types/search-global.type";

export const getUK = async (): Promise<UkType> => {
  const { data } = await axiosInstance.get<UkType>("/usulan-kegiatan");
  return data;
};

export const getTahunAnggaran = async (): Promise<string[]> => {
  const { data: res } = await axiosInstance.get<{ data: string[] }>("/usulan-kegiatan/tahun");
  return res.data;
};

export const searchUk = async (
  filters: filter,
): Promise<{ data: UkType[]; meta: Meta }> => {
  const { data: res } = await axiosInstance.get<{
    data: { data: UkType[]; meta: Meta };
  }>("/usulan-kegiatan/search", { params: filters });
  return res.data
};

export const updateUk = async (
  id: number,
  body: Partial<Pick<UkType, "komponen_programId" | "satuanId" | "volume" | "harga_satuan" | "tahun_anggaran">>,
): Promise<UkType> => {
  const { data: res } = await axiosInstance.patch<{ data: UkType }>(
    `/usulan-kegiatan/${id}`,
    body,
  );
  return res.data;
};

export const createUk = async (
  body: Pick<UkType, "tahun_anggaran"> & Partial<Pick<UkType, "komponen_programId" | "satuanId" | "parentId" | "volume" | "harga_satuan">>,
): Promise<UkType> => {
  const { data: res } = await axiosInstance.post<{ data: UkType }>(
    "/usulan-kegiatan",
    body,
  );
  return res.data;
};

export const deleteUk = async (id: number): Promise<UkType> => {
  const { data: res } = await axiosInstance.delete<{ data: UkType }>(
    `/usulan-kegiatan/${id}`,
  );
  return res.data;
};
