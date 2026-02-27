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
import { CalendarDays } from "lucide-react";
import { useCreateUk } from "../hooks/uk.hook";
import { parseAsString, parseAsInteger, useQueryStates } from "nuqs";
import { format } from "date-fns";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

export default function TambahUkDialog() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
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
    const dateString = format(date, "yyyy-MM-dd");
    createUk(
      { tahun_anggaran: dateString },
      {
        onSuccess: () => {
          setUrlFilters({ tahun_anggaran: dateString, page: 1 });
          setOpen(false);
          setDate(undefined);
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

          <div className="space-y-1 py-2 flex flex-col">
            <label className="text-sm font-medium">Tanggal Anggaran</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd-MM-yyyy") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={!date || isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
