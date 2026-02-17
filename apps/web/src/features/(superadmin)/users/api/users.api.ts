import axiosInstance from "@/src/lib/axios";
import { User, Meta } from "../types/users.type";

export const getDataTable = async (filters?: {
  search?: string;
  role?: string;
  permission?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<{ data: User[]; meta: Meta }> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.role) params.append("role", filters.role);
  if (filters?.permission && filters.permission.length > 0) {
    filters.permission.forEach(p => params.append("permission", p));
  }
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const { data } = await axiosInstance.get<{
    data: { data: User[]; meta: Meta };
  }>(`/user/search?${params.toString()}`);
  return data.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/user/${id}`);
};

export const getPermissions = async (): Promise<{ id: number; name: string }[]> => {
  const { data } = await axiosInstance.get<{ data: { id: number; name: string }[] }>(
    "/user/permission"
  );
  return data.data;
};
