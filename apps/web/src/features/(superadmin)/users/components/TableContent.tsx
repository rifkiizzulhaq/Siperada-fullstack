"use client";

import { Input } from "@workspace/ui/components/input";
import Cards from "./Card";
import { SelectRoles } from "./SelectRoles";
import { SelectPermissions } from "./SelectPermissions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Trash, ChevronUp, ChevronDown, ChevronsUpDown, Plus, SquarePen } from "lucide-react";
import { UsersForm } from "./dialog/UserForm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useDataTableUser } from "../hooks/useUser.hooks";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteUser } from "../api/users.api";
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
import { useUsersStore } from "../store/users.store";
import { useState, useEffect } from "react";
import { 
  useQueryStates, 
  parseAsInteger, 
  parseAsString, 
  parseAsArrayOf 
} from 'nuqs';
import { useDebounce } from 'use-debounce';

export default function TableContent() {
  const [urlFilters, setUrlFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      role: parseAsString,
      permission: parseAsArrayOf(parseAsString),
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(5),
      sortBy: parseAsString.withDefault("id"),
      sortOrder: parseAsString.withDefault("DESC"),
    },
    {
      history: "replace",
      shallow: false,
    }
  );

  const [searchValue, setSearchValue] = useState(urlFilters.search);
  const [debouncedSearch] = useDebounce(searchValue, 1000);

  useEffect(() => {
    setUrlFilters({ search: debouncedSearch || null, page: 1 });
  }, [debouncedSearch, setUrlFilters]);

  const filters = {
    ...urlFilters,
    role: urlFilters.role ?? undefined,
    permission: urlFilters.permission ?? undefined,
    sortOrder: (urlFilters.sortOrder as "ASC" | "DESC") || "DESC",
  };

  const { data: response, isLoading, error } = useDataTableUser(filters);
  const queryClient = useQueryClient();
  const { openDialog } = useUsersStore();

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-table"] });
      toast.success("User berhasil di hapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus user: " + error.message);
    },
  });

  const handlerHapus = (id: number) => {
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

  const user = response?.data;
  const meta = response?.meta;

  return (
    <div className="w-full space-y-4">
      <Cards />
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Cari..."
          className="w-full order-last sm:order-none sm:max-w-sm"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <SelectRoles />
        <SelectPermissions />
        <div className="flex items-center gap-2 order-first sm:order-none sm:ml-auto">
          <Button size="sm" className="w-full sm:w-auto" onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Tambah User
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
                  Name {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email {renderSortIcon("email")}
                </div>
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permission</TableHead>
              <TableHead>kode Unit</TableHead>
              <TableHead>Nama Unit</TableHead>
              <TableHead>Bidang</TableHead>
              <TableHead>Nip</TableHead>
              <TableHead>Nidn</TableHead>
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
            ) : user?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Tidak ada data user.
                </TableCell>
              </TableRow>
            ) : (
              user?.map((item, index) => (
                <TableRow key={item?.id}>
                  <TableCell className="capitalize">
                    {index + 1 + (urlFilters.page - 1) * urlFilters.limit}
                  </TableCell>
                  <TableCell className="capitalize">{item?.name}</TableCell>
                  <TableCell className="lowercase">{item?.email}</TableCell>
                  <TableCell className="capitalize">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                      {item?.role.name}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {item?.permissions.slice(0, 3).map((perm) => (
                        <span key={perm.id} className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-foreground/20 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          {perm.name}
                        </span>
                      ))}
                      {item?.permissions.length > 3 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <span className="inline-flex cursor-pointer items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-foreground/20 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                              +{item.permissions.length - 3} more
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-4">
                            <div className="flex flex-wrap gap-1">
                              {item?.permissions.map((perm) => (
                                <span key={perm.id} className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-foreground/20 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                  {perm.name}
                                </span>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {item?.unit?.kode_unit || "-"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {item?.unit?.nama_unit || "-"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {item?.role.name === "unit" && item?.unit?.bidang || "-"}
                    {item?.role.name === "pemimpin" && item?.pemimpin?.bidang}
                  </TableCell>
                  <TableCell className="lowercase">
                    {item?.role.name === "unit" && item?.unit?.nip}
                    {item?.role.name === "admin" && item?.admin?.nip}
                    {item?.role.name === "pemimpin" && item?.pemimpin?.nip}
                  </TableCell>
                  <TableCell className="lowercase">
                    {item?.role.name === "admin" && item?.admin?.nidn || "-"}
                    {item?.role.name === "pemimpin" && item?.pemimpin?.nidn}
                  </TableCell>

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
                        onClick={() => handlerHapus(item.id)}
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
      <UsersForm />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah kamu yakin ingin menghapus user ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun user secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
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
