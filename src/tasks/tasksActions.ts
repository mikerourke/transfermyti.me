import { createAction, createAsyncAction } from "typesafe-actions";
import { Mapping, TasksByIdModel } from "~/typeDefs";

export const createTasks = createAsyncAction(
  "@tasks/CREATE_TASKS_REQUEST",
  "@tasks/CREATE_TASKS_SUCCESS",
  "@tasks/CREATE_TASKS_FAILURE",
)<void, Record<Mapping, TasksByIdModel>, void>();

export const deleteTasks = createAsyncAction(
  "@tasks/DELETE_TASKS_REQUEST",
  "@tasks/DELETE_TASKS_SUCCESS",
  "@tasks/DELETE_TASKS_FAILURE",
)<void, void, void>();

export const fetchTasks = createAsyncAction(
  "@tasks/FETCH_TASKS_REQUEST",
  "@tasks/FETCH_TASKS_SUCCESS",
  "@tasks/FETCH_TASKS_FAILURE",
)<void, Record<Mapping, TasksByIdModel>, void>();

export const flipIsTaskIncluded = createAction("@tasks/FLIP_IS_INCLUDED")<
  string
>();

export const updateIsTaskIncluded = createAction("@tasks/UPDATE_IS_INCLUDED")<{
  id: string;
  isIncluded: boolean;
}>();

export const updateAreAllTasksIncluded = createAction(
  "@tasks/UPDATE_ARE_ALL_INCLUDED",
)<boolean>();
