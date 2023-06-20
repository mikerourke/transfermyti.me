import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type { Mapping, Task } from "~/types";

export const areAllTasksIncludedUpdated = createAction<boolean>(
  "@tasks/areAllTasksIncludedUpdated",
);

export const isTaskIncludedToggled = createAction<string>(
  "@tasks/isTaskIncludedToggled",
);

export const isTaskIncludedUpdated = createAction<{
  id: string;
  isIncluded: boolean;
}>("@tasks/isTaskIncludedUpdated");

export const createTasks = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Task>>,
  undefined
>("@tasks/createTasks");

export const deleteTasks = createAsyncAction<undefined, undefined, undefined>(
  "@tasks/deleteTasks",
);

export const fetchTasks = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Task>>,
  undefined
>("@tasks/fetchTasks");
