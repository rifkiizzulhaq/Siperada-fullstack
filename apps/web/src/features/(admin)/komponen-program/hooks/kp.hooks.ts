import { useMutation, useQuery } from "@tanstack/react-query";
import { create, getAllKp, getKategori, searchKp, update, deletes } from "../api/kp.api";
import { filter } from "../types/kp.type";
import { KpSchema } from "../schema/kp.schema";

export const useSearchKp = (filters: Partial<filter>) => {
  return useQuery({
    queryKey: ["search-kp", filters],
    queryFn: () => searchKp(filters),
  });
};

export const useGetKategori = () => {
  return useQuery({
    queryKey: ["kategori-list"],
    queryFn: getKategori,
  });
};

export const useGetAllKp = () => {
  return useQuery({
    queryKey: ["kp-all"],
    queryFn: getAllKp,
  });
};

const extractErrorMessage = (error: unknown, fallback = "Terjadi kesalahan"): string => {
  const raw =
    (error as { response?: { data?: { message?: string | string[] } } })?.response
      ?.data?.message;
  if (Array.isArray(raw)) return raw[0] ?? fallback;
  if (typeof raw === "string") return raw;
  return fallback;
};

export const useCreateKp = (
  onSuccess?: () => void,
  onError?: (message: string) => void,
) => {
  return useMutation({
    mutationFn: (data: KpSchema) => create(data),
    onSuccess,
    onError: (error: unknown) => {
      onError?.(extractErrorMessage(error));
    },
  });
};

export const useUpdateKp = (
  onSuccess?: () => void,
  onError?: (message: string) => void,
) => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: KpSchema }) =>
      update(id, data),
    onSuccess,
    onError: (error: unknown) => {
      onError?.(extractErrorMessage(error));
    },
  });
};

export const useDeleteKp = (
  onSuccess?: () => void,
  onError?: (message: string) => void,
) => {
  return useMutation({
    mutationFn: (id: number) => deletes(id),
    onSuccess,
    onError: (error: unknown) => {
      onError?.(extractErrorMessage(error, "Terjadi kesalahan saat menghapus"));
    },
  });
};
