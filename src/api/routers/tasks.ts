import { ApiInstance, useApiInstance } from "../../hooks";
import { createRouter, procedure } from "../../lib/router";
import { TaskDto, Task } from "../types";

const path = "/api/v1/tasks";

const mapTask = (source: TaskDto): Task => {
  return {
    ...source,
    // add here you future mappings
  };
};

export const createTasksRouter = (api: ApiInstance) => {
  return createRouter({
    getAll: procedure.query(async () => {
      const data = await api.get<TaskDto[]>(path);
      return data.map(mapTask);
    }),
    getById: procedure.query(async (id: string) => {
      const data = await api.get<TaskDto>(`${path}/${id}`);
      return mapTask(data);
    }),
    store: procedure.mutation(async (task: TaskDto): Promise<Task> => {
      if (task.id) {
        const data = await api.put<TaskDto>(`${path}/${task.id}`, task);
        return mapTask(data);
      }
      const data = await api.post<TaskDto>(path, task);
      return mapTask(data);
    }),
    remove: procedure.mutation(async (id: string): Promise<Task> => {
      const data = await api.delete<TaskDto>(`${path}/${id}`);
      return mapTask(data);
    }),
  });
};
