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
import { Plus, ChevronsUpDown } from "lucide-react";

export default function SatuanContent() {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Cari satuan..."
          className="w-full order-last sm:order-none sm:max-w-sm"
        />
        <div className="flex items-center gap-2 order-first sm:order-none sm:ml-auto">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Tambah Satuan
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead className="cursor-pointer">
                <div className="flex items-center">
                  Nama Satuan <ChevronsUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                Tidak ada data satuan.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
            Page 1 of 1 (0 items)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}