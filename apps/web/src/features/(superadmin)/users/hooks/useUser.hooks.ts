import { useQuery } from "@tanstack/react-query";
import { getDataTable, getPermissions } from "../api/users.api";
import { User, Meta } from "../types/users.type";
import { useUsersStore } from "../store/users.store";

export const useDataTableUser = () => {
  const { filters } = useUsersStore();
  
  const res = useQuery<{ data: User[], meta: Meta }>({
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
