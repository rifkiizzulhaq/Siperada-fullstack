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
import {
  Trash,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Plus,
  SquarePen,
} from "lucide-react";
import { useDeleteKategori, useTableKategori } from "../hooks/useKategori";
import { useKategoriStore } from "../store/kategori.store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { useDebounce } from "use-debounce";
import KategoriForm from "./dialog/KategoriForm";
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
import { toast } from "@workspace/ui/components/sonner";

export default function KategoriTableContent() {
  const [urlFilters, setUrlFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(5),
      sortBy: parseAsString.withDefault("id"),
      sortOrder: parseAsString.withDefault("DESC"),
    },
    {
      history: "replace",
      shallow: false,
    },
  );

  const [searchValue, setSearchValue] = useState(urlFilters.search);
  const [debouncedSearch] = useDebounce(searchValue, 1000);

  useEffect(() => {
    setUrlFilters({ search: debouncedSearch || null, page: 1 });
  }, [debouncedSearch, setUrlFilters]);

  const filters = {
    search: urlFilters.search,
    page: urlFilters.page,
    limit: urlFilters.limit,
    sortBy: urlFilters.sortBy,
    sortOrder: (urlFilters.sortOrder as "ASC" | "DESC") || "DESC",
  };

  const { data: res, isLoading, error } = useTableKategori(filters);
  const queryClient = useQueryClient();
  const { openDialog } = useKategoriStore();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMutation = useDeleteKategori(
    () => {
      queryClient.invalidateQueries({ queryKey: ["data-table"] });
      toast.success("Kategori berhasil dihapus");
      setDeleteId(null);
    },
    (message) => {
      toast.error(message);
      setDeleteId(null);
    },
  );

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleSort = (field: string) => {
    const isAsc = urlFilters.sortBy === field && urlFilters.sortOrder === "ASC";
    setUrlFilters({
      sortBy: field,
      sortOrder: isAsc ? "DESC" : "ASC",
    });
  };

  const renderSortIcon = (field: string) => {
    if (urlFilters.sortBy !== field)
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return urlFilters.sortOrder === "ASC" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const kategori = res?.data;
  const meta = res?.meta;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Cari kategori..."
          className="w-full order-last sm:order-none sm:max-w-sm"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <div className="flex items-center gap-2 order-first sm:order-none sm:ml-auto">
          <Button size="sm" className="w-full sm:w-auto" onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Nama Kategori {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="h-24 text-center text-red-500 dark:text-white"
                >
                  {error instanceof Error ? error.message : "An error occurred"}
                </TableCell>
              </TableRow>
            ) : kategori?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Tidak ada data kategori.
                </TableCell>
              </TableRow>
            ) : (
              kategori?.map((item, index) => (
                <TableRow key={item?.id}>
                  <TableCell className="capitalize">
                    {index + 1 + (urlFilters.page - 1) * urlFilters.limit}
                  </TableCell>
                  <TableCell className="capitalize">{item?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => openDialog(item)}
                      >
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
      <KategoriForm />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Apakah kamu yakin ingin menghapus kategori ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus kategori secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {meta &&
            `Page ${meta.page || 1} of ${meta.totalPages || 1} (${meta.total || 0} items)`}
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
            disabled={!meta || urlFilters.page >= meta.totalPages}
            onClick={() => setUrlFilters({ page: urlFilters.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
