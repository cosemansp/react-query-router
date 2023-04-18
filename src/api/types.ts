import { components } from "./swaggerSchema";

//
// Task
//
export type TaskDto = components["schemas"]["task"];
export type TaskCreateDto = components["schemas"]["taskCreate"];
export type TaskUpdateDto = components["schemas"]["taskUpdate"];

export interface Task extends TaskDto {
  // no-op: ready for extension
}

//
// User
//
export type UserDto = components["schemas"]["user"];
export type UserListDto = components["schemas"]["userList"];
export type UserCreateDto = components["schemas"]["userCreate"];
export type UserUpdateDto = components["schemas"]["userUpdate"] & {
  id: string;
};

export interface User extends Omit<UserDto, "createAt"> {
  createAt: Date;
}

//
// Product
//
export type ProductDto = components["schemas"]["product"];
export type ProductCreateDto = components["schemas"]["productCreate"];
export type ProductUpdateDto = components["schemas"]["productUpdate"] & {
  id: string;
};

export interface Product extends Omit<ProductDto, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

//
// Basket
//
export type BasketDto = components["schemas"]["basket"];

export interface Basket extends BasketDto {
  // no-op: ready for extension
}
