import { createAsyncAction, createAction } from "typesafe-actions";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { TasksByIdModel } from "~/tasks/tasksTypes";

export const createTasks = createAsyncAction(
  "@tasks/CREATE_TASKS_REQUEST",
  "@tasks/CREATE_TASKS_SUCCESS",
  "@tasks/CREATE_TASKS_FAILURE",
)<void, Record<Mapping, TasksByIdModel>, void>();

export const fetchTasks = createAsyncAction(
  "@tasks/FETCH_TASKS_REQUEST",
  "@tasks/FETCH_TASKS_SUCCESS",
  "@tasks/FETCH_TASKS_FAILURE",
)<void, Record<Mapping, TasksByIdModel>, void>();

export const flipIsTaskIncluded = createAction("@tasks/FLIP_IS_INCLUDED")<
  string
>();
