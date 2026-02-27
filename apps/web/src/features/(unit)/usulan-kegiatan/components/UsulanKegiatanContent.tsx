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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Plus, Trash2 } from "lucide-react";
import { useSearchUk, useUpdateUk, useTahunAnggaran, useCreateUk, useDeleteUk } from "../hooks/uk.hook";
import { format } from "date-fns";
import TambahUkDialog from "./TambahUkDialog";
import { useGetAllKpForUnit } from "@/src/features/(admin)/komponen-program/hooks/kp.hooks";
import { useGetAllSatuanForUnit } from "@/src/features/(admin)/satuan/hooks/useSatuan";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebounce } from "use-debounce";

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
    {
      history: "replace",
      shallow: true,
    },
  );

  const [debouncedSearch] = useDebounce(urlFilters.search, 1000);

  // const { data } = useUk();
  // console.log(data);

  const { data: res, isLoading, error } = useSearchUk({
    search: debouncedSearch,
    page: urlFilters.page,
    limit: urlFilters.limit,
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder as "ASC" | "DESC",
    tahun_anggaran: urlFilters.tahun_anggaran || undefined,
  });

  const router = useRouter();
  const { mutate: createUk } = useCreateUk();
  const { mutate: deleteUk } = useDeleteUk();

  // Dropdown dari endpoint /all yang accessible untuk role unit
  const { data: kpList } = useGetAllKpForUnit();
  const { data: satuanList } = useGetAllSatuanForUnit();
  const { data: tahunList } = useTahunAnggaran();

  // Track kode yang dipilih per row: { [rowId]: kpId }
  const [selectedKpIds, setSelectedKpIds] = useState<Record<number, number>>({});

  // Auto-save mutation
  const { mutate: updateUk } = useUpdateUk();

  // Debounce timer refs untuk input angka (per rowId + field)
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const debouncedUpdate = (
    id: number,
    field: "volume" | "harga_satuan",
    value: number,
    delay = 800,
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

  const meta = res?.meta;

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Cari komponen program / kode..."
            className="w-full sm:w-64"
            value={urlFilters.search}
            onChange={(e) => setUrlFilters({ search: e.target.value || null, page: 1 })}
          />
          <Select
            value={urlFilters.tahun_anggaran || ""}
            onValueChange={(val) =>
              setUrlFilters({ tahun_anggaran: val, page: 1 })
            }
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tahun Anggaran" />
            </SelectTrigger>
            <SelectContent>
              {tahunList?.map((dateStr: string) => {
                if (!dateStr) return null;
                const formattedOptions = format(new Date(dateStr), "dd-MM-yyyy");
                return (
                  <SelectItem key={dateStr} value={dateStr}>
                    {formattedOptions}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <TambahUkDialog />
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
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-red-500 dark:text-white"
                >
                  {error instanceof Error ? error.message : "An error occurred"}
                </TableCell>
              </TableRow>
            ) : res?.data.length === 0 || !urlFilters.tahun_anggaran ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Tidak ada data Program.
                </TableCell>
              </TableRow>
            ) : (
              res?.data?.map((row, index) => (
                <TableRow key={row.id} className="align-middle">
                  {/* No */}
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {index + 1}
                </TableCell>

                {/* Kode — Select dari data Komponen Program, auto-save saat dipilih */}
                <TableCell>
                  <Select
                    value={selectedKpIds[row.id] ? String(selectedKpIds[row.id]) : (row.komponen_program?.id ? String(row.komponen_program.id) : undefined)}
                    onValueChange={(val) => {
                      const kpId = Number(val);
                      setSelectedKpIds((prev) => ({ ...prev, [row.id]: kpId }));
                      updateUk({ id: row.id, body: { komponen_programId: kpId } });
                    }}
                  >
                    <SelectTrigger className="h-8 text-sm font-mono">
                      <SelectValue placeholder="Pilih kode..." />
                    </SelectTrigger>
                    <SelectContent>
                      {kpList?.map((kp) => (
                        <SelectItem key={kp.id} value={String(kp.id)}>
                          {kp.kode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Komponen Program — otomatis mengikuti kode yang dipilih */}
                <TableCell className="text-sm">
                  {getKpName(row.id, row.komponen_program)}
                </TableCell>

                {/* Usulan Kegiatan — dropdown */}

                {/* Volume — auto-save setelah berhenti mengetik 800ms */}
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

                {/* Satuan — Select dari data Satuan API, auto-save saat dipilih */}
                <TableCell>
                    <Select
                    defaultValue={row.satuan?.id ? String(row.satuan.id) : undefined}
                    onValueChange={(val) =>
                      updateUk({ id: row.id, body: { satuanId: Number(val) } })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Pilih satuan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {satuanList?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Harga Satuan — auto-save setelah berhenti mengetik 800ms */}
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

                {/* Total Biaya — otomatis (read only) */}
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
                        onClick={() => {
                          if (confirm("Apakah anda yakin ingin menghapus data ini?")) {
                            deleteUk(row.id);
                          }
                        }}
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

      {/* Footer: pagination + simpan semua */}
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {meta?.page ?? 1} of {meta?.totalPages ?? 1} ({meta?.total ?? 0}{" "} items)
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
