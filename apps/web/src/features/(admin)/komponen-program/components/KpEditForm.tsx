"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { useGetKategori, useUpdateKp, useGetAllKp } from "../hooks/kp.hooks";
import { KpSchema } from "../schema/kp.schema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface KpEditFormProps {
  id: number;
}

export default function KpEditForm({ id }: KpEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: kategoriList, isLoading: isKategoriLoading } = useGetKategori();
  const { data: kpAll, isLoading: isKpLoading } = useGetAllKp();

  // Cari data item berdasarkan id
  const initialData = kpAll?.find((kp) => kp.id === id);

  // Filter diri sendiri dari list kode_parent
  const kpOptions = kpAll?.filter((kp) => kp.id !== id) ?? [];

  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<KpSchema>({
    resolver: zodResolver(KpSchema),
    defaultValues: { kategoriId: 0, kode: "", name: "", kode_parent: null },
  });

  // Reset form setelah data tersedia
  useEffect(() => {
    if (initialData) {
      reset({
        kategoriId: initialData.kategoriId,
        kode: initialData.kode,
        name: initialData.name,
        kode_parent: initialData.kode_parent ?? null,
      });
    }
  }, [initialData, reset]);

  const updateMutation = useUpdateKp(
    () => {
      queryClient.invalidateQueries({ queryKey: ["search-kp"] });
      queryClient.invalidateQueries({ queryKey: ["kp-all"] });
      toast.success("Komponen program berhasil diperbarui");
      router.push("/komponen-program");
    },
    (message) => {
      if (message.toLowerCase().includes("kode")) {
        setError("kode", { message });
      } else {
        toast.error(message);
      }
    },
  );

  const onSubmit = (data: KpSchema) => updateMutation.mutate({ id, data });

  if (isKpLoading) {
    return (
      <div className="flex flex-col items-center py-6 px-4">
        <div className="w-full max-w-2xl flex items-center gap-3 mb-6">
          <Button type="button" variant="outline" size="icon" onClick={() => router.push("/komponen-program")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold leading-none">Edit Komponen Program</h1>
          </div>
        </div>
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Memuat data...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex flex-col items-center py-6 px-4">
        <p className="text-muted-foreground">Data tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center gap-3 mb-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => router.push("/komponen-program")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold leading-none">
            Edit Komponen Program
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ubah data komponen program yang sudah ada.
          </p>
        </div>
      </div>

      {/* Card Form */}
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Komponen Program</CardTitle>
          <CardDescription>
            Field bertanda <span className="text-red-500">*</span> wajib diisi.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Kategori — Searchable Combobox */}
            <div className="grid gap-1.5">
              <Label htmlFor="kategoriId">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="kategoriId"
                control={control}
                render={({ field }) => {
                  const selected = kategoriList?.find((k) => k.id === field.value);
                  return (
                    <Popover open={kategoriOpen} onOpenChange={setKategoriOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={kategoriOpen}
                          className="w-full justify-between font-normal"
                        >
                          {selected ? selected.name : (isKategoriLoading ? "Memuat..." : "Pilih kategori...")}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Command>
                          <CommandInput placeholder="Cari kategori..." />
                          <CommandList className="max-h-[150px] overflow-y-auto">
                            <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                              {kategoriList?.map((k) => (
                                <CommandItem
                                  key={k.id}
                                  value={k.name}
                                  onSelect={() => {
                                    field.onChange(k.id);
                                    setKategoriOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === k.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {k.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
              {errors.kategoriId && (
                <p className="text-xs text-red-500">{errors.kategoriId.message}</p>
              )}
            </div>

            {/* Kode Parent — Searchable Combobox */}
            <div className="grid gap-1.5">
              <Label htmlFor="kode_parent">Kode Parent</Label>
              <Controller
                name="kode_parent"
                control={control}
                render={({ field }) => {
                  const selected = kpOptions.find((kp) => kp.id === field.value);
                  return (
                    <Popover open={parentOpen} onOpenChange={setParentOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={parentOpen}
                          className="w-full justify-between font-normal"
                        >
                          {selected
                            ? `${selected.kode} — ${selected.name}`
                            : "Pilih kode parent (opsional)..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Command>
                          <CommandInput placeholder="Cari komponen program..." />
                          <CommandList className="max-h-[150px] overflow-y-auto">
                            <CommandEmpty>Komponen program tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="__none__"
                                onSelect={() => {
                                  field.onChange(null);
                                  setParentOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value == null ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                — Tidak ada parent —
                              </CommandItem>
                              {kpOptions.map((kp) => (
                                <CommandItem
                                  key={kp.id}
                                  value={`${kp.kode} ${kp.name}`}
                                  onSelect={() => {
                                    field.onChange(kp.id);
                                    setParentOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === kp.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {kp.kode} — {kp.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
              {errors.kode_parent && (
                <p className="text-xs text-red-500">{errors.kode_parent.message}</p>
              )}
            </div>

            {/* Kode */}
            <div className="grid gap-1.5">
              <Label htmlFor="kode">
                Kode <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kode"
                placeholder="contoh: KP-001"
                className="max-w-xs"
                {...register("kode")}
              />
              {errors.kode && (
                <p className="text-xs text-red-500">{errors.kode.message}</p>
              )}
            </div>

            {/* Nama */}
            <div className="grid gap-1.5">
              <Label htmlFor="name">
                Nama Komponen Program <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama komponen program..."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <Separator />

            {/* Tombol Aksi */}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/komponen-program")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
