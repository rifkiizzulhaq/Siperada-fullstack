"use client";

import { useRouter } from "next/navigation";

import { Input } from "@workspace/ui/components/input";
import { useRef, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Check, ChevronsUpDown, Loader2, Plus, Trash2 } from "lucide-react";
import { useSearchUk, useUpdateUk, useTahunAnggaran, useCreateUk, useDeleteUk } from "../hooks/uk.hook";
import { format } from "date-fns";
import TambahUkDialog from "./TambahUkDialog";
import { useGetAllKpForUnit } from "@/src/features/(admin)/komponen-program/hooks/kp.hooks";
import { useGetAllSatuanForUnit } from "@/src/features/(admin)/satuan/hooks/useSatuan";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebounce } from "use-debounce";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
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
import { cn } from "@workspace/ui/lib/utils";

export default function UsulanKegiatanContent() {
  const [urlFilters, setUrlFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      sortBy: parseAsString.withDefault("id"),
      sortOrder: parseAsString.withDefault("ASC"),
      tahun_anggaran: parseAsString.withDefault(""),
    },
    { history: "replace", shallow: true },
  );

  const [debouncedSearch] = useDebounce(urlFilters.search, 1000);

  const { data: res, isLoading, isFetching, error } = useSearchUk({
    search: debouncedSearch,
    page: urlFilters.page,
    limit: urlFilters.limit,
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder as "ASC" | "DESC",
    tahun_anggaran: urlFilters.tahun_anggaran || undefined,
  });

  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { mutate: createUk } = useCreateUk();
  const { mutate: deleteUk } = useDeleteUk();

  const { data: kpList } = useGetAllKpForUnit();
  const { data: satuanList } = useGetAllSatuanForUnit();
  const { data: tahunList } = useTahunAnggaran();

  const [selectedKpIds, setSelectedKpIds] = useState<Record<number, number>>({});
  const [openKpId, setOpenKpId] = useState<number | null>(null);
  const [openSatuanId, setOpenSatuanId] = useState<number | null>(null);
  const [tahunOpen, setTahunOpen] = useState(false);

  const { mutate: updateUk } = useUpdateUk();
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const debouncedUpdate = (
    id: number,
    field: "volume" | "harga_satuan",
    value: number,
    delay = 1000,
  ) => {
    const key = `${id}-${field}`;
    clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(() => {
      updateUk({ id, body: { [field]: value } });
    }, delay);
  };

  const getKpName = (rowId: number, fallbackKp: { id?: number; name: string } | null) => {
    const selectedId = selectedKpIds[rowId];
    if (!selectedId) return fallbackKp?.name || "";
    return kpList?.find((kp) => kp.id === selectedId)?.name ?? fallbackKp?.name ?? "";
  };

  const tahunOptions = tahunList?.filter(Boolean).map((dateStr: string) => ({
    value: dateStr,
    label: format(new Date(dateStr), "dd-MM-yyyy"),
  })) ?? [];

  const selectedTahunLabel = tahunOptions.find(
    (o) => o.value === urlFilters.tahun_anggaran
  )?.label;

  const meta = res?.meta;

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Input
            placeholder="Cari komponen program / kode..."
            className="w-full sm:w-64"
            value={urlFilters.search}
            onChange={(e) => setUrlFilters({ search: e.target.value || null, page: 1 })}
          />

          {/* Tahun Anggaran — Combobox */}
          <div className="flex items-center gap-2">
            <Popover open={tahunOpen} onOpenChange={setTahunOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={tahunOpen}
                className={cn(
                  "w-full sm:w-44 justify-between font-normal",
                  !selectedTahunLabel && "text-muted-foreground"
                )}
              >
                <span className="truncate">{selectedTahunLabel ?? "Pilih Tahun Anggaran"}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
              <Command>
                <CommandInput placeholder="Cari tahun..." />
                <CommandList className="max-h-[200px] overflow-y-auto">
                  <CommandEmpty>Tahun tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {tahunOptions.map((o) => (
                      <CommandItem
                        key={o.value}
                        value={o.label}
                        onSelect={() => {
                          setUrlFilters({ tahun_anggaran: o.value, page: 1 });
                          setTahunOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", urlFilters.tahun_anggaran === o.value ? "opacity-100" : "opacity-0")} />
                        {o.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
            </Popover>
            {isFetching && !isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="flex sm:justify-end">
          <TambahUkDialog />
        </div>
      </div>

      {/* Tabel Inline Editable */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10 text-center">No</TableHead>
              <TableHead className="min-w-[240px]">Kode</TableHead>
              <TableHead className="min-w-[200px]">Komponen Program</TableHead>
              <TableHead className="w-24 text-right">Volume</TableHead>
              <TableHead className="w-36">Satuan</TableHead>
              <TableHead className="w-36 text-right">Harga Satuan</TableHead>
              <TableHead className="w-36 text-right">Total Biaya</TableHead>
              <TableHead className="w-20 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-red-500 dark:text-white">
                  {error instanceof Error ? error.message : "An error occurred"}
                </TableCell>
              </TableRow>
            ) : res?.data.length === 0 || !urlFilters.tahun_anggaran ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Tidak ada data Usulan Kegiatan.
                </TableCell>
              </TableRow>
            ) : (
              res?.data?.map((row, index) => (
                <TableRow key={row.id} className="align-middle">
                  {/* No */}
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {index + 1}
                  </TableCell>

                  {/* Kode — Combobox */}
                  <TableCell>
                    <Popover
                      open={openKpId === row.id}
                      onOpenChange={(open) => setOpenKpId(open ? row.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="h-8 w-full justify-between text-sm font-mono font-normal"
                        >
                          <span className="truncate">
                            {selectedKpIds[row.id]
                              ? kpList?.find((kp) => kp.id === selectedKpIds[row.id])?.kode
                              : (row.komponen_program?.kode || "Pilih kode...")}
                          </span>
                          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Command>
                          <CommandInput placeholder="Cari kode KP..." />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>Kode tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                              {kpList?.map((kp) => (
                                <CommandItem
                                  key={kp.id}
                                  value={`${kp.kode} ${kp.name}`}
                                  onSelect={() => {
                                    setSelectedKpIds((prev) => ({ ...prev, [row.id]: kp.id } as Record<number, number>));
                                    updateUk({ id: row.id, body: { komponen_programId: kp.id } });
                                    setOpenKpId(null);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", (selectedKpIds[row.id] ?? row.komponen_program?.id) === kp.id ? "opacity-100" : "opacity-0")} />
                                  {kp.kode}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  {/* Komponen Program — otomatis */}
                  <TableCell className="text-sm">
                    {getKpName(row.id, row.komponen_program)}
                  </TableCell>

                  {/* Volume */}
                  <TableCell>
                    <Input
                      defaultValue={row.volume}
                      placeholder="0"
                      type="number"
                      min={0}
                      className="h-8 text-sm text-right"
                      onChange={(e) => debouncedUpdate(row.id, "volume", Number(e.target.value))}
                    />
                  </TableCell>

                  {/* Satuan — Combobox */}
                  <TableCell>
                    <Popover
                      open={openSatuanId === row.id}
                      onOpenChange={(open) => setOpenSatuanId(open ? row.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "h-8 w-full justify-between text-sm font-normal",
                            !row.satuan?.id && !selectedKpIds[row.id] && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {satuanList?.find((s) => s.id === row.satuan?.id)?.name ?? "Pilih satuan..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Command>
                          <CommandInput placeholder="Cari satuan..." />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>Satuan tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                              {satuanList?.map((s) => (
                                <CommandItem
                                  key={s.id}
                                  value={s.name}
                                  onSelect={() => {
                                    updateUk({ id: row.id, body: { satuanId: s.id } });
                                    setOpenSatuanId(null);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", row.satuan?.id === s.id ? "opacity-100" : "opacity-0")} />
                                  {s.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>

                  {/* Harga Satuan */}
                  <TableCell>
                    <Input
                      defaultValue={row.harga_satuan}
                      placeholder="0"
                      type="number"
                      min={0}
                      className="h-8 text-sm text-right"
                      onChange={(e) => debouncedUpdate(row.id, "harga_satuan", Number(e.target.value))}
                    />
                  </TableCell>

                  {/* Total Biaya */}
                  <TableCell className="text-right">
                    <div className="h-8 px-3 flex items-center justify-end rounded-md bg-muted text-sm text-muted-foreground">
                      {(row.volume * row.harga_satuan).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      })}
                    </div>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs w-[130px] justify-between"
                        disabled={
                          !row.komponen_program?.id ||
                          !row.satuan?.id ||
                          !row.volume ||
                          row.volume <= 0 ||
                          !row.harga_satuan ||
                          row.harga_satuan <= 0
                        }
                        onClick={() => {
                          const categoryName = row.komponen_program?.kategori?.name;
                          if (categoryName === "Judul Kegiatan") {
                            router.push("/judul-kegiatan");
                          } else {
                            if (urlFilters.tahun_anggaran) {
                              createUk({ tahun_anggaran: urlFilters.tahun_anggaran, parentId: row.id });
                            }
                          }
                        }}
                      >
                        <span className="truncate">
                          {getKpName(row.id, row.komponen_program) ? (row.komponen_program?.kategori?.name || "Program") : "Program"}
                        </span>
                        <Plus className="h-3 w-3 shrink-0" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Alert Dialog Konfirmasi Hapus */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Baris Usulan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteUk(deleteId, { onSettled: () => setDeleteId(null) }); }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer: pagination */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {meta?.page ?? 1} of {meta?.totalPages ?? 1} ({meta?.total ?? 0} items)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={urlFilters.page <= 1}
            onClick={() => setUrlFilters({ page: urlFilters.page - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={urlFilters.page >= (meta?.totalPages ?? 1)}
            onClick={() => setUrlFilters({ page: urlFilters.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
