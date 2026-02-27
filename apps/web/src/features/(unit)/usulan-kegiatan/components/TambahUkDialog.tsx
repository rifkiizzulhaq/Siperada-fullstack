"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { CalendarDays, Loader2 } from "lucide-react";
import { useCreateUk } from "../hooks/uk.hook";
import { parseAsString, parseAsInteger, useQueryStates } from "nuqs";

export default function TambahUkDialog() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const { mutate: createUk, isPending } = useCreateUk();

  const [, setUrlFilters] = useQueryStates(
    {
      tahun_anggaran: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
    },
    { history: "replace", shallow: true },
  );

  const handleSubmit = () => {
    if (!date) return;
    createUk(
      { tahun_anggaran: date },
      {
        onSuccess: () => {
          setUrlFilters({ tahun_anggaran: date, page: 1 });
          setOpen(false);
          setDate("");
        },
      },
    );
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <CalendarDays className="mr-2 h-4 w-4" /> Tambah Tahun Anggaran
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Tambah Tahun Anggaran</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5 py-2">
            <label className="text-sm font-medium">Tanggal Anggaran</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={!date || isPending}>
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
              ) : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
