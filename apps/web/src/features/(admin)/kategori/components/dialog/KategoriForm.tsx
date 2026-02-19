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
import {
  createKategoriInput,
  kategoriSchema,
} from "../../schema/kategori.schema";
import { useKategoriStore } from "../../store/kategori.store";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateKategori, useUpdateKategori } from "../../hooks/useKategori";
import { toast } from "@workspace/ui/components/sonner";
import { useEffect } from "react";

export default function KategoriForm() {
  const { isDialogOpen, closeDialog, selectKategori } = useKategoriStore();
  const mode = selectKategori ? "edit" : "add";
  const id = selectKategori?.id;

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<createKategoriInput>({
    resolver: zodResolver(kategoriSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isDialogOpen && mode === "edit" && selectKategori) {
      setValue("name", selectKategori.name);
    } else if (isDialogOpen && mode === "add") {
      reset({
        name: "",
      });
    }
  }, [selectKategori, setValue, isDialogOpen, reset, mode]);

  const handleClose = () => {
    closeDialog();
    setTimeout(() => {
      reset();
    }, 200);
  };

  const createMutation = useCreateKategori(() => {
    queryClient.invalidateQueries({ queryKey: ["data-table"] });
    toast.success("Berhasil menambahkan kategori");
    handleClose();
  });

  const updateMutation = useUpdateKategori(() => {
    queryClient.invalidateQueries({ queryKey: ["data-table"] });
    toast.success("Berhasil mengupdate kategori");
    handleClose();
  });

  const onSubmit = (data: createKategoriInput) => {
    if (mode === "add") {
      createMutation.mutate(data);
    } else if (mode === "edit" && id) {
      updateMutation.mutate({ id, data });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Tambah Kategori" : "Edit Kategori"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Tambahkan kategori baru untuk data master."
                : "Ubah data kategori yang sudah ada."}{" "}
              Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label
                htmlFor="name"
                className="w-full sm:w-[130px] shrink-0 text-left"
              >
                Nama Kategori
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <Input
                  id="name"
                  placeholder="ketik disini"
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
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
