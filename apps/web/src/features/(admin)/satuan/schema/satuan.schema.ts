import z from "zod";

export const satuanSchema = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
});

export type SatuanSchema = z.infer<typeof satuanSchema>;