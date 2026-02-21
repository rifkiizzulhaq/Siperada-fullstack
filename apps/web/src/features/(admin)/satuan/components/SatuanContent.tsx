"use client";

import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Plus, ChevronsUpDown, ChevronUp, ChevronDown, SquarePen, Trash } from "lucide-react";
import { useDeleteSatuan, useSearch } from "../hooks/useSatuan";
import { useSatuanStore } from "../store/satuan.store";
import SatuanForm from "./dialog/SatuanForm";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebounce } from "use-debounce";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/sonner";
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

export default function SatuanContent() {
  const { openDialog } = useSatuanStore();
  const queryClient = useQueryClient();
  const [deleteId, seteDeleteId] = useState<number | null>(null);

  const [urlFilters, setUrlFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(10),
      sortBy: parseAsString.withDefault("name"),
      sortOrder: parseAsString.withDefault("DESC"),
    },
    {
      history: "replace",
      shallow: true,
    },
  );

  const [debouncedSearch] = useDebounce(urlFilters.search, 1000);

  const {
    data: search,
    isLoading,
    error,
  } = useSearch({
    search: debouncedSearch,
    page: urlFilters.page,
    limit: urlFilters.limit,
    sortBy: urlFilters.sortBy,
    sortOrder: urlFilters.sortOrder as "ASC" | "DESC",
  });

  const handleDelete = (id: number) => {
    seteDeleteId(id);
  };

  const deletes = useDeleteSatuan(() => {
    queryClient.invalidateQueries({ queryKey: ["satuan-search"] });
    toast.success("satuan berhasil di hapus");
    seteDeleteId(null);
  });

  const handleSort = (column: string) => {
    if (urlFilters.sortBy === column) {
      setUrlFilters({ sortOrder: urlFilters.sortOrder === "ASC" ? "DESC" : "ASC", page: 1 });
    } else {
      setUrlFilters({ sortBy: column, sortOrder: "ASC", page: 1 });
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (urlFilters.sortBy !== column) return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return urlFilters.sortOrder === "ASC"
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />;
  };

  const meta = search?.meta;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Cari satuan..."
          className="w-full order-last sm:order-none sm:max-w-sm"
          value={urlFilters.search}
          onChange={(e) =>
            setUrlFilters({ search: e.target.value || null, page: 1 })
          }
        />
        <div className="flex items-center gap-2 order-first sm:order-none sm:ml-auto">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => openDialog()}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Satuan
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                <div className="flex items-center">
                  Nama Satuan <SortIcon column="name" />
                </div>
              </TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-red-500 dark:text-white"
                >
                  {error instanceof Error ? error.message : "An error occurred"}
                </TableCell>
              </TableRow>
            ) : search?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Tidak ada data Satuan.
                </TableCell>
              </TableRow>
            ) : (
              search?.data?.map((item, index) => (
                <TableRow key={item?.id}>
                  <TableCell>
                    {index + 1 + (urlFilters.page - 1) * urlFilters.limit}
                  </TableCell>
                  <TableCell className="capitalize">{item?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button size="sm" onClick={() => openDialog(item)}>
                        <SquarePen className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => item?.id && handleDelete(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <SatuanForm />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && seteDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah kamu yakin ingin menghapus satuan ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus satuan
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deletes.mutate(deleteId);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {meta?.page ?? 1} of {meta?.totalPages ?? 1} ({meta?.total ?? 0}{" "}
          items)
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
