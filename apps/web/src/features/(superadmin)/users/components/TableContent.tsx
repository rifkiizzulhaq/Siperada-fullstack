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
import { Trash, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { UsersDialog } from "./dialog/UserDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useDataTableUser } from "../hooks/useUser.hooks";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteUser } from "../api/users.api";
import EditUsers from "./EditUsers";
import { useUsersStore } from "../store/users.store";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TableContent() {
  const { data: response, isLoading, error } = useDataTableUser();
  const queryClient = useQueryClient();
  const { filters, setSearch, setFilters } = useUsersStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for debounce
  const [searchValue, setSearchValue] = useState(filters.search);

  // Sync URL/Store -> Local Search State
  useEffect(() => {
    const SearchValue = () => {
      setSearchValue(filters.search);
    };
    SearchValue()
  }, [filters.search]);

  // Debounce Logic
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== filters.search) {
        setSearch(searchValue);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [searchValue, setSearch, filters.search]);

  // Sync URL -> Store on mount
  useEffect(() => {
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const permission = searchParams.getAll("permission");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    if (search || role || (permission && permission.length > 0) || page || limit || sortBy || sortOrder) {
      setFilters({
        search: search || "",
        role: role || undefined,
        permission: permission.length > 0 ? permission : undefined,
        page: page ? parseInt(page) || 1 : 1,
        limit: limit ? parseInt(limit) || 10 : 10,
        sortBy: sortBy || "id",
        sortOrder: (sortOrder as "ASC" | "DESC") || "DESC",
      });
    }
  }, [searchParams, setFilters]);

  // Sync Store -> URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.role) params.append("role", filters.role);
    if (filters.permission && filters.permission.length > 0) {
      filters.permission.forEach((p) => params.append("permission", p));
    }
    if (filters.page && filters.page !== 1)
      params.append("page", filters.page.toString());
    if (filters.limit && filters.limit !== 10)
      params.append("limit", filters.limit.toString());
    if (filters.sortBy && filters.sortBy !== "id")
      params.append("sortBy", filters.sortBy);
    if (filters.sortOrder && filters.sortOrder !== "DESC")
      params.append("sortOrder", filters.sortOrder);

    const newString = params.toString();
    const currentString = searchParams.toString();

    if (newString !== currentString) {
      router.replace(`${pathname}?${newString}`);
    }
  }, [filters, pathname, router, searchParams]);

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-table"] });
      alert("User deleted successfully");
    },
    onError: (error) => {
      alert("Failed to delete user: " + error.message);
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["data-table"] });
  };

  const handlerHapus = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSort = (field: string) => {
    if (filters.sortBy === field) {
      setFilters({
        sortOrder: filters.sortOrder === "ASC" ? "DESC" : "ASC",
      });
    } else {
      setFilters({
        sortBy: field,
        sortOrder: "ASC",
      });
    }
  };

  const renderSortIcon = (field: string) => {
    if (filters.sortBy !== field)
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    return filters.sortOrder === "ASC" ? (
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
      <div className="flex items-center gap-2">
        <Input
          placeholder="Cari..."
          className="max-w-sm"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <SelectRoles />
        <SelectPermissions />
        <div className="flex items-center gap-2 ml-auto">
          <UsersDialog />
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
                    {index + 1 + (Number(filters.page) && !isNaN(Number(filters.page)) && Number(filters.page) > 0 ? Number(filters.page) - 1 : 0) * (Number(filters.limit) && !isNaN(Number(filters.limit)) && Number(filters.limit) > 0 ? Number(filters.limit) : 10)}
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
                      {item?.permissions.slice(0, 3).map((perm: any) => (
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
                              {item?.permissions.map((perm: any) => (
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
                    {item?.role.name === "unit" && item?.unit?.bidang}
                    {item?.role.name === "pemimpin" && item?.pemimpin?.bidang}
                  </TableCell>
                  <TableCell className="lowercase">
                    {item?.role.name === "unit" && item?.unit?.nip}
                    {item?.role.name === "admin" && item?.admin?.nip}
                    {item?.role.name === "pemimpin" && item?.pemimpin?.nip}
                  </TableCell>
                  <TableCell className="lowercase">
                    {item?.role.name === "admin" && item?.admin?.nidn}
                    {item?.role.name === "pemimpin" && item?.pemimpin?.nidn}
                  </TableCell>

                  <TableCell className="text-center flex items-center justify-center">
                    <EditUsers item={item} onSuccess={handleRefresh} />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mx-2"
                      onClick={() => handlerHapus(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {meta &&
            `Page ${meta.page || 1} of ${meta.totalPages || 1} (${meta.total || 0} items)`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page <= 1}
            onClick={() => setFilters({ page: filters.page - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta || filters.page >= meta.totalPages}
            onClick={() => setFilters({ page: filters.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
