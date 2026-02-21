import { useMutation, useQuery } from "@tanstack/react-query";
import { create, update, deletes, SearchAkunDetail } from "../api/akun-detail.api";
import { filter } from "../types/akun-detail.type";
import { AkunDetailSchema } from "../schema/akun-detail.schema";

export const useSearchAkunDetail = (filters: Partial<filter>) => {
  return useQuery({
    queryKey: ["akun-detail-search", filters],
    queryFn: () => SearchAkunDetail(filters),
  });
};

export const useCreateAkunDetail = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (data: AkunDetailSchema) => create(data),
    onSuccess,
  });
};

export const useUpdateAkunDetail = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AkunDetailSchema }) =>
      update(id, data),
    onSuccess,
  });
};

export const useDeleteAkunDetail = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (id: number) => deletes(id),
    onSuccess,
  });
};
