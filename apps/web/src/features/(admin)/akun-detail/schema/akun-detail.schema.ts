import z from "zod";

export const akunDetailSchema = z.object({
  kode: z.string().min(1, "Kode tidak boleh kosong"),
  name: z.string().min(1, "Nama tidak boleh kosong"),
});

export type AkunDetailSchema = z.infer<typeof akunDetailSchema>;
