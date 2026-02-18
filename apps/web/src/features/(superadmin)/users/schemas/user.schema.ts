import { z } from "zod";

const commonFields = {
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  permissionsId: z.array(z.number()).min(1, "Permissions harus dipilih"),
};

const nipValidation = z
  .string()
  .length(18, "NIP harus 18 digit")
  .regex(/^\d+$/, "NIP harus berupa angka");

const nidnValidation = z
  .string()
  .length(10, "NIDN harus 10 digit")
  .regex(/^\d+$/, "NIDN harus berupa angka");

const passwordValidation = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&#)"
  );

const adminRoleSchema = z.object({
  role: z.literal("admin"),
  nip: nipValidation,
  nidn: nidnValidation,
});

const unitRoleSchema = z.object({
  role: z.literal("unit"),
  kode_unit: z.string().min(1, "Kode Unit harus diisi"),
  nama_unit: z.string().min(1, "Nama Unit harus diisi"),
  bidang: z.string().min(1, "Bidang harus diisi"),
  nip: nipValidation,
});

const pemimpinRoleSchema = z.object({
  role: z.literal("pemimpin"),
  bidang: z.string().min(1, "Bidang harus diisi"),
  nip: nipValidation,
  nidn: nidnValidation,
});

const roleUnionSchema = z.discriminatedUnion("role", [
  adminRoleSchema,
  unitRoleSchema,
  pemimpinRoleSchema,
], {
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
      return { message: "Role harus dipilih" };
    }
    return { message: ctx.defaultError };
  }
});

export const createUserSchema = z.intersection(
  z.object({
    ...commonFields,
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Konfirmasi Password harus diisi"),
  }),
  roleUnionSchema
).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const updateUserSchema = z.intersection(
  z.object({
    ...commonFields,
    password: passwordValidation.optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  }),
  roleUnionSchema
).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
