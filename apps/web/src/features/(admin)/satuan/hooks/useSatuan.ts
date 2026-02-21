import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllSatuan, Search, create, update, deletes } from "../api/satuan.api";
import { filterType } from "../types/satuan.type";
import { SatuanSchema } from "../schema/satuan.schema";

export const useGetAllsatuan = () => {
  return useQuery({
    queryKey: ["data-satuan"],
    queryFn: getAllSatuan,
  });
};

export const useSearch = (filter: Partial<filterType>) => {
  return useQuery({
    queryKey: ["satuan-search", filter],
    queryFn: () => Search(filter),
  });
};

export const useCreateSatuan = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (data: SatuanSchema) => create(data),
    onSuccess,
  });
};

export const useUpdateSatuan = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SatuanSchema }) =>
      update(id, data),
    onSuccess,
  });
};

export const useDeleteSatuan = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (id: number) => deletes(id),
    onSuccess,
  });
};