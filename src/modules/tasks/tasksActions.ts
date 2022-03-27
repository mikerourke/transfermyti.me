import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, Task } from "~/typeDefs";

export const createTasks = createAsyncAction(
  "@tasks/createTasksRequest",
  "@tasks/createTasksSuccess",
  "@tasks/createTasksFailure",
)<undefined, Record<Mapping, Dictionary<Task>>, undefined>();

export const deleteTasks = createAsyncAction(
  "@tasks/deleteTasksRequest",
  "@tasks/deleteTasksSuccess",
  "@tasks/deleteTasksFailure",
)<undefined, undefined, undefined>();

export const fetchTasks = createAsyncAction(
  "@tasks/fetchTasksRequest",
  "@tasks/fetchTasksSuccess",
  "@tasks/fetchTasksFailure",
)<undefined, Record<Mapping, Dictionary<Task>>, undefined>();

export const isTaskIncludedToggled = createAction(
  "@tasks/isTaskIncludedToggled",
)<string>();

export const isTaskIncludedUpdated = createAction(
  "@tasks/isTaskIncludedUpdated",
)<{
  id: string;
  isIncluded: boolean;
}>();

export const areAllTasksIncludedUpdated = createAction(
  "@tasks/areAllTasksIncludedUpdated",
)<boolean>();
