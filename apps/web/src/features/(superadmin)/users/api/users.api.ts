import axiosInstance from "@/src/lib/axios";
import { User, UserTableFilters } from "../types/users.type";
import { CreateUserInput, UpdateUserInput } from "../schemas/user.schema";
import { Meta } from "@/src/types/search-global.type";

export type CreateUserPayload = Omit<CreateUserInput, "confirmPassword">;
export type UpdateUserPayload = Omit<UpdateUserInput, "confirmPassword">;

export const getPermissions = async (): Promise<
  { id: number; name: string }[]
> => {
  const { data } = await axiosInstance.get<{
    data: { id: number; name: string }[];
  }>("/user/permission");
  return data.data;
};

export const getRoles = async (): Promise<{ id: number; name: string }[]> => {
  const { data } = await axiosInstance.get<{
    data: { id: number; name: string }[];
  }>("/user/roles");
  return data.data;
};

export const createUser = async (data: CreateUserPayload): Promise<void> => {
  await axiosInstance.post("/user", data);
};

export const updateUser = async (
  id: number,
  data: UpdateUserPayload,
): Promise<void> => {
  await axiosInstance.patch(`/user/${id}`, data);
};

export const deleteUser = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/user/${id}`);
};

export const getDataTable = async (
  filters?: Partial<UserTableFilters>,
): Promise<{ data: User[]; meta: Meta }> => {
  const { data } = await axiosInstance.get<{
    data: { data: User[]; meta: Meta };
  }>("/user/search", { params: filters });
  return data.data;
};
