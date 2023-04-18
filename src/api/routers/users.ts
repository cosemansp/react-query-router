import { ApiInstance } from "../../hooks";
import { createRouter, procedure } from "../../lib/router";
import { UserDto, UserListDto, User, UserCreateDto, UserUpdateDto } from "../types";

const mapUser = (user: UserDto): User => ({
  ...user,
  createAt: new Date(user.createdAt),
});

const path = "/api/v1/users";

type GetAllInput = { page?: number; pageSize?: number; sortBy?: string };

export const createUsersRouter = (api: ApiInstance) => {
  return createRouter({
    getAll: procedure.query(async ({ page = 0, pageSize = 20, sortBy }: GetAllInput) => {
      const data = await api.get<UserListDto>(path, {
        query: { page, pageSize, sortBy },
      });
      return {
        ...data,
        items: data.items.map(mapUser),
      };
    }),

    getById: procedure.query(async (id: string) => {
      const data = await api.get<UserDto>(`${path}/${id}`);
      return mapUser(data);
    }),

    save: procedure.mutation(async (user: UserCreateDto | UserUpdateDto) => {
      if ("id" in user && user.id) {
        const data = await api.put<UserDto>(`${path}/${user.id}`, user);
        return mapUser(data);
      }
      const data = await api.post<UserDto>(path, user);
      return mapUser(data);
    }),

    remove: procedure.mutation(async (id: string) => {
      const data = await api.delete<UserDto>(`${path}/${id}`);
      return mapUser(data);
    }),
  });
};
