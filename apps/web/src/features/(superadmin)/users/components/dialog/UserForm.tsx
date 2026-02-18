"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  useForm,
  FieldErrors,
  Controller,
  useWatch,
} from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  updateUserSchema,
  CreateUserInput,
  UpdateUserInput,
} from "../../schemas/user.schema";
import {
  useCreateUser,
  useUpdateUser,
  useRoles,
} from "../../hooks/useUser.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { CreateUserPayload, UpdateUserPayload } from "../../api/users.api";
import { FormPermissionSelect } from "./FormPermissionSelect";
import { useUsersStore } from "../../store/users.store";
import { toast } from "@workspace/ui/components/sonner";

type FormData = CreateUserInput | UpdateUserInput;

type UnitFormData = Extract<FormData, { role: "unit" }>;
type AdminFormData = Extract<FormData, { role: "admin" }>;
type PemimpinFormData = Extract<FormData, { role: "pemimpin" }>;

export const UsersForm = () => {
  const { isDialogOpen, closeDialog, selectedUser } = useUsersStore();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const mode = selectedUser ? "edit" : "add";
  const id = selectedUser?.id;

  const queryClient = useQueryClient();

  const schema = mode === "add" ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: undefined,
      permissionsId: [],
    },
  });

  const createUserMutation = useCreateUser(() => {
    closeDialog();
    setTimeout(() => {
      reset();
    }, 200);
    queryClient.invalidateQueries({ queryKey: ["data-table"] });
    toast.success("User berhasil dibuat");
  });

  const updateUserMutation = useUpdateUser(() => {
    closeDialog();
    setTimeout(() => {
      reset();
    }, 200);
    queryClient.invalidateQueries({ queryKey: ["data-table"] });
    toast.success("User berhasil diperbarui");
  });

  const selectedRole = useWatch({ control, name: "role" });

  useEffect(() => {
    if (isDialogOpen && mode === "edit" && selectedUser) {
      setValue("name", selectedUser.name);
      setValue("email", selectedUser.email);
      const roleName = selectedUser.role.name as FormData["role"];
      setValue("role", roleName);

      if (selectedUser.permissions) {
        setValue(
          "permissionsId",
          selectedUser.permissions.map((p) => p.id),
        );
      }

      if (roleName === "unit" && selectedUser.unit) {
        setValue("kode_unit", selectedUser.unit.kode_unit);
        setValue("nama_unit", selectedUser.unit.nama_unit);
        setValue("bidang", selectedUser.unit.bidang);
        setValue("nip", selectedUser.unit.nip);
      } else if (roleName === "admin" && selectedUser.admin) {
        setValue("nip", selectedUser.admin.nip);
        setValue("nidn", selectedUser.admin.nidn);
      } else if (roleName === "pemimpin" && selectedUser.pemimpin) {
        setValue("bidang", selectedUser.pemimpin.bidang);
        setValue("nip", selectedUser.pemimpin.nip);
        setValue("nidn", selectedUser.pemimpin.nidn);
      }
    } else if (isDialogOpen && mode === "add") {
      reset({
        role: undefined,
        permissionsId: [],
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        nip: "",
        nidn: "",
        kode_unit: "",
        nama_unit: "",
        bidang: "",
      });
    }
  }, [mode, selectedUser, setValue, isDialogOpen, reset]);

  const { data: roles } = useRoles();

  const onSubmit = (data: FormData) => {
    const roleObj = roles?.find((r) => r.name === data.role);
    if (!roleObj) {
      toast.error("Role tidak valid atau role belum dimuat");
      return;
    }

    // Destructure to remove role and confirmPassword, and keep the rest
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role, confirmPassword, ...rest } = data;

    const basePayload = {
      ...rest,
      roleId: roleObj.id,
    };

    if (mode === "add") {
      createUserMutation.mutate(basePayload as unknown as CreateUserPayload);
    } else if (mode === "edit" && id) {
      const updatePayload = { ...basePayload };

      if (!updatePayload.password) {
        delete updatePayload.password;
      }

      updateUserMutation.mutate({
        id,
        data: updatePayload as unknown as UpdateUserPayload,
      });
    }
  };

  const isLoading =
    createUserMutation.isPending || updateUserMutation.isPending;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeDialog();
      setTimeout(() => {
        reset();
      }, 200);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Tambah User" : "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add" ? "Buat User Baru Disini." : "Edit User Disini."}{" "}
              Klik simpan jika sudah selesai.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Common Fields - Horizontal Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label
                htmlFor="name"
                className="w-full sm:w-[130px] shrink-0 text-left"
              >
                Name
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <Input id="name" placeholder="John Doe" {...register("name")} />
                {errors.name && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label
                htmlFor="email"
                className="w-full sm:w-[130px] shrink-0 text-left"
              >
                Email
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <Input
                  id="email"
                  placeholder="john@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label
                htmlFor="password"
                className="w-full sm:w-[130px] shrink-0 text-left"
              >
                Password{" "}
                {mode === "edit" && (
                  <span className="text-[10px] sm:block inline text-muted-foreground">
                    (Optional)
                  </span>
                )}
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "add" ? "S3cur3P@ssw0rd" : "********"}
                    {...register("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label
                htmlFor="confirmPassword"
                className="w-full sm:w-[130px] shrink-0 text-left"
              >
                Confirm Password
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={mode === "add" ? "S3cur3P@ssw0rd" : "********"}
                    {...register("confirmPassword")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label
                htmlFor="role"
                className="w-full sm:w-[130px] shrink-0 text-left"
              >
                Role
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <Select
                  onValueChange={(val) => {
                    setValue("role", val as FormData["role"]);
                    setValue("permissionsId", []);
                  }}
                  value={selectedRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="unit">Unit</SelectItem>
                    <SelectItem value="pemimpin">Pemimpin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.role.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Label className="w-full sm:w-[130px] shrink-0 text-left">
                Permissions
              </Label>
              <div className="flex-1 flex flex-col w-full">
                <Controller
                  control={control}
                  name="permissionsId"
                  render={({ field }) => (
                    <FormPermissionSelect
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.permissionsId?.message}
                      role={selectedRole}
                    />
                  )}
                />
              </div>
            </div>

            {selectedRole === "unit" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="kode_unit"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    Kode Unit
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="kode_unit"
                      placeholder="001"
                      {...register("kode_unit" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<UnitFormData>).kode_unit && (
                      <span className="text-red-500 text-xs mt-1">
                        {
                          (errors as FieldErrors<UnitFormData>).kode_unit
                            ?.message
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="nama_unit"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    Nama Unit
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="nama_unit"
                      placeholder="Unit TI"
                      {...register("nama_unit" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<UnitFormData>).nama_unit && (
                      <span className="text-red-500 text-xs mt-1">
                        {
                          (errors as FieldErrors<UnitFormData>).nama_unit
                            ?.message
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="bidang"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    Bidang
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="bidang"
                      placeholder="Teknik"
                      {...register("bidang" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<UnitFormData>).bidang && (
                      <span className="text-red-500 text-xs mt-1">
                        {(errors as FieldErrors<UnitFormData>).bidang?.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="nip"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    NIP
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="nip"
                      placeholder="1990..."
                      {...register("nip" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<UnitFormData>).nip && (
                      <span className="text-red-500 text-xs mt-1">
                        {(errors as FieldErrors<UnitFormData>).nip?.message}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedRole === "admin" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="nip"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    NIP
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="nip"
                      placeholder="1990..."
                      {...register("nip" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<AdminFormData>).nip && (
                      <span className="text-red-500 text-xs mt-1">
                        {(errors as FieldErrors<AdminFormData>).nip?.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="nidn"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    NIDN
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="nidn"
                      placeholder="00..."
                      {...register("nidn" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<AdminFormData>).nidn && (
                      <span className="text-red-500 text-xs mt-1">
                        {(errors as FieldErrors<AdminFormData>).nidn?.message}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedRole === "pemimpin" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="bidang"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    Bidang
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="bidang"
                      placeholder="Akademik"
                      {...register("bidang" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<PemimpinFormData>).bidang && (
                      <span className="text-red-500 text-xs mt-1">
                        {
                          (errors as FieldErrors<PemimpinFormData>).bidang
                            ?.message
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="nip"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    NIP
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="nip"
                      placeholder="1990..."
                      {...register("nip" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<PemimpinFormData>).nip && (
                      <span className="text-red-500 text-xs mt-1">
                        {(errors as FieldErrors<PemimpinFormData>).nip?.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <Label
                    htmlFor="nidn"
                    className="w-full sm:w-[130px] shrink-0 text-left"
                  >
                    NIDN
                  </Label>
                  <div className="flex-1 flex flex-col w-full">
                    <Input
                      id="nidn"
                      placeholder="00..."
                      {...register("nidn" as unknown as keyof FormData)}
                    />
                    {(errors as FieldErrors<PemimpinFormData>).nidn && (
                      <span className="text-red-500 text-xs mt-1">
                        {
                          (errors as FieldErrors<PemimpinFormData>).nidn
                            ?.message
                        }
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
