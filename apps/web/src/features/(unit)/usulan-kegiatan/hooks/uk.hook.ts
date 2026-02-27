import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUK, getTahunAnggaran, searchUk, updateUk, createUk, deleteUk } from "../api/uk.type";
import { filter, UkType } from "../types/uk.type";
import { toast } from "@workspace/ui/components/sonner";

export const useUk = () => {
  return useQuery({
    queryKey: ["data-uk"],
    queryFn: getUK,
  });
};

export const useTahunAnggaran = () => {
  return useQuery({
    queryKey: ["tahun-anggaran"],
    queryFn: getTahunAnggaran,
  });
};

export const useSearchUk = (filters: filter) => {
  return useQuery({
    queryKey: ["search-uk", filters],
    queryFn: () => searchUk(filters),
  });
};

export const useUpdateUk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Partial<Pick<UkType, "komponen_programId" | "satuanId" | "parentId" | "volume" | "harga_satuan" | "tahun_anggaran">>;
    }) => updateUk(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-uk"] });
      queryClient.invalidateQueries({ queryKey: ["tahun-anggaran"] });
      toast.success("Tersimpan", { duration: 1500 });
    },
    onError: () => {
      toast.error("Gagal menyimpan, coba lagi.");
    },
  });
};

export const useCreateUk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Pick<UkType, "tahun_anggaran"> & Partial<Pick<UkType, "komponen_programId" | "satuanId" | "parentId" | "volume" | "harga_satuan">>) =>
      createUk(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-uk"] });
      queryClient.invalidateQueries({ queryKey: ["tahun-anggaran"] });
      toast.success("Usulan kegiatan berhasil ditambahkan!");
    },
    onError: () => {
      toast.error("Gagal menambahkan usulan kegiatan.");
    },
  });
};

export const useDeleteUk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUk(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-uk"] });
      queryClient.invalidateQueries({ queryKey: ["tahun-anggaran"] });
      toast.success("Baris usulan berhasil dihapus");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Gagal menghapus baris usulan";
      toast.error(errorMessage);
    },
  });
};
