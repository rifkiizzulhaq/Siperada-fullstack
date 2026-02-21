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
import { akunDetailSchema, AkunDetailSchema } from "../../schema/akun-detail.schema";
import { useAkunDetailStore } from "../../store/akun-detail.store";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAkunDetail, useUpdateAkunDetail } from "../../hooks/useAkunDetail";
import { toast } from "@workspace/ui/components/sonner";
import { useEffect } from "react";

export default function AkunDetailForm() {
  const { isDialogOpen, closeDialog, selectedAkunDetail } = useAkunDetailStore();
  const mode = selectedAkunDetail ? "edit" : "add";
  const id = selectedAkunDetail?.id;

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AkunDetailSchema>({
    resolver: zodResolver(akunDetailSchema),
    defaultValues: { kode: "", name: "" },
  });

  useEffect(() => {
    if (isDialogOpen && mode === "edit" && selectedAkunDetail) {
      setValue("kode", selectedAkunDetail.kode);
      setValue("name", selectedAkunDetail.name);
    } else if (isDialogOpen && mode === "add") {
      reset({ kode: "", name: "" });
    }
  }, [selectedAkunDetail, setValue, isDialogOpen, reset, mode]);

  const handleClose = () => {
    closeDialog();
    setTimeout(() => reset(), 200);
  };

  const createMutation = useCreateAkunDetail(() => {
    queryClient.invalidateQueries({ queryKey: ["akun-detail-search"] });
    toast.success("Berhasil menambahkan akun detail");
    handleClose();
  });

  const updateMutation = useUpdateAkunDetail(() => {
    queryClient.invalidateQueries({ queryKey: ["akun-detail-search"] });
    toast.success("Berhasil mengupdate akun detail");
    handleClose();
  });

  const onSubmit = (data: AkunDetailSchema) => {
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
              {mode === "add" ? "Tambah Akun Detail" : "Edit Akun Detail"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Tambahkan akun detail baru untuk data master."
                : "Ubah data akun detail yang sudah ada."}{" "}
              Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label htmlFor="kode" className="w-full sm:w-[130px] shrink-0">
                Kode
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <Input
                  id="kode"
                  placeholder="521..."
                  {...register("kode")}
                />
                {errors.kode && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.kode.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label htmlFor="name" className="w-full sm:w-[130px] shrink-0">
                Nama Akun Detail
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <Input
                  id="name"
                  placeholder="ketik disini..."
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
