import { useApiInstance } from "../../hooks";
import { createRouter } from "../../lib/router";
import { createProductRouter } from "./products";
import { createUsersRouter } from "./users";
import { createTasksRouter } from "./tasks";

export const useQueryRouter = () => {
  const api = useApiInstance();
  return createRouter({
    settings: createProductRouter(api),
    users: createUsersRouter(api),
    tasks: createTasksRouter(api),
  });
};
