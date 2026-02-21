import { useMutation, useQuery } from "@tanstack/react-query";
import { filter } from "../types/kategori.type";
import { Kategori } from "../types/kategori.type";
import { Meta } from "@/src/types/search-global.type";
import { create, deletes, getAllKategori, searchKategori, update } from "../api/kategori.api";
import { createKategoriInput } from "../schema/kategori.schema";
import { KategoriResponse } from "../types/kategori.type";

export type createKategoriSchema = Omit<createKategoriInput, "id">;

export const useTableKategori = (
  filters: filter = {
    search: "",
    page: 1,
    limit: 10,
    sortBy: "id",
    sortOrder: "DESC",
  },
) => {
  const res = useQuery<KategoriResponse>({
    queryKey: ["data-table", filters],
    queryFn: () => searchKategori(filters),
  });

  return res;
};

export const useAllKategori = () => {
  return useQuery<Kategori[]>({
    queryKey: ["all-kategori"],
    queryFn: () => getAllKategori(),
  });
};

export const useCreateKategori = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (data: createKategoriSchema) => create(data),
    onSuccess,
  });
};

export const useUpdateKategori = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: createKategoriSchema }) =>
      update(id, data),
    onSuccess,
  });
};

export const useDeleteKategori = (
  onSuccess?: () => void,
  onError?: (message: string) => void,
) => {
  return useMutation({
    mutationFn: (id: number) => deletes(id),
    onSuccess,
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Terjadi kesalahan saat menghapus";
      onError?.(message);
    },
  });
};
