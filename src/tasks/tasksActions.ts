import { createAsyncAction, createAction } from "typesafe-actions";
import { MappedEntityRecordsModel } from "~/common/commonTypes";
import { TaskModel } from "~/tasks/tasksTypes";

export const createClockifyTasks = createAsyncAction(
  "@tasks/CREATE_CLOCKIFY_TASKS_REQUEST",
  "@tasks/CREATE_CLOCKIFY_TASKS_SUCCESS",
  "@tasks/CREATE_CLOCKIFY_TASKS_FAILURE",
)<string, void, void>();

export const createTogglTasks = createAsyncAction(
  "@tasks/CREATE_TOGGL_TASKS_REQUEST",
  "@tasks/CREATE_TOGGL_TASKS_SUCCESS",
  "@tasks/CREATE_TOGGL_TASKS_FAILURE",
)<string, void, void>();

export const fetchClockifyTasks = createAsyncAction(
  "@tasks/FETCH_CLOCKIFY_TASKS_REQUEST",
  "@tasks/FETCH_CLOCKIFY_TASKS_SUCCESS",
  "@tasks/FETCH_CLOCKIFY_TASKS_FAILURE",
)<string, MappedEntityRecordsModel<TaskModel>, void>();

export const fetchTogglTasks = createAsyncAction(
  "@tasks/FETCH_TOGGL_TASKS_REQUEST",
  "@tasks/FETCH_TOGGL_TASKS_SUCCESS",
  "@tasks/FETCH_TOGGL_TASKS_FAILURE",
)<string, MappedEntityRecordsModel<TaskModel>, void>();

export const flipIsTaskIncluded = createAction("@tasks/FLIP_IS_INCLUDED")<
  string
>();
