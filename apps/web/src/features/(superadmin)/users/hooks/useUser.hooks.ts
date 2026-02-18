import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getDataTable,
  getPermissions,
  getRoles,
  createUser,
  updateUser,
  CreateUserPayload,
  UpdateUserPayload,
} from "../api/users.api";
import { User, Meta } from "../types/users.type";
import { useUsersStore } from "../store/users.store";

export const useDataTableUser = () => {
  const { filters } = useUsersStore();

  const res = useQuery<{ data: User[]; meta: Meta }>({
    queryKey: ["data-table", filters],
    queryFn: () => getDataTable(filters),
  });
  return res;
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => getPermissions(),
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(),
  });
};

export const useCreateUser = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (data: CreateUserPayload) => createUser(data),
    onSuccess,
  });
};

export const useUpdateUser = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      updateUser(id, data),
    onSuccess,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const [total, admin, unit, pemimpin] = await Promise.all([
        getDataTable({ limit: 1 }),
        getDataTable({ role: "admin", limit: 1 }),
        getDataTable({ role: "unit", limit: 1 }),
        getDataTable({ role: "pemimpin", limit: 1 }),
      ]);

      return {
        total: total.meta.total,
        admin: admin.meta.total,
        unit: unit.meta.total,
        pemimpin: pemimpin.meta.total,
      };
    },
  });
};
