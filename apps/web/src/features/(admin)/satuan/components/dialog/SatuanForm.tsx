"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { satuanSchema, SatuanSchema } from "../../schema/satuan.schema";
import { useSatuanStore } from "../../store/satuan.store";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSatuan, useUpdateSatuan } from "../../hooks/useSatuan";
import { toast } from "@workspace/ui/components/sonner";
import { useEffect } from "react";

export default function SatuanForm() {
  const { isDialogOpen, closeDialog, selectSatuan } = useSatuanStore();
  const mode = selectSatuan ? "edit" : "add";
  const id = selectSatuan?.id;

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SatuanSchema>({
    resolver: zodResolver(satuanSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (isDialogOpen && mode === "edit" && selectSatuan) {
      setValue("name", selectSatuan.name);
    } else if (isDialogOpen && mode === "add") {
      reset({ name: "" });
    }
  }, [selectSatuan, setValue, isDialogOpen, reset, mode]);

  const handleClose = () => {
    closeDialog();
    setTimeout(() => reset(), 200);
  };

  const createMutation = useCreateSatuan(() => {
    queryClient.invalidateQueries({ queryKey: ["satuan-search"] });
    toast.success("Berhasil menambahkan satuan");
    handleClose();
  });

  const updateMutation = useUpdateSatuan(() => {
    queryClient.invalidateQueries({ queryKey: ["satuan-search"] });
    toast.success("Berhasil mengupdate satuan");
    handleClose();
  });

  const onSubmit = (data: SatuanSchema) => {
    if (mode === "add") {
      createMutation.mutate(data);
    } else if (mode === "edit" && id) {
      updateMutation.mutate({ id, data });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Tambah Satuan" : "Edit Satuan"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Tambahkan satuan baru untuk data master."
                : "Ubah data satuan yang sudah ada."}{" "}
              Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label htmlFor="name" className="w-full sm:w-[130px] shrink-0">
                Nama Satuan
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <Input
                  id="name"
                  placeholder="contoh: Tahun, Bulan.."
                  {...register("name")}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
