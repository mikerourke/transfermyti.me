import { createAsyncAction, createAction } from "typesafe-actions";
import { MappedEntityRecordsModel } from "~/common/commonTypes";
import { ProjectModel } from "./projectsTypes";

export const createClockifyProjects = createAsyncAction(
  "@projects/CREATE_CLOCKIFY_PROJECTS_REQUEST",
  "@projects/CREATE_CLOCKIFY_PROJECTS_SUCCESS",
  "@projects/CREATE_CLOCKIFY_PROJECTS_FAILURE",
)<string, void, void>();

export const createTogglProjects = createAsyncAction(
  "@projects/CREATE_TOGGL_PROJECTS_REQUEST",
  "@projects/CREATE_TOGGL_PROJECTS_SUCCESS",
  "@projects/CREATE_TOGGL_PROJECTS_FAILURE",
)<string, void, void>();

export const fetchClockifyProjects = createAsyncAction(
  "@projects/FETCH_CLOCKIFY_PROJECTS_REQUEST",
  "@projects/FETCH_CLOCKIFY_PROJECTS_SUCCESS",
  "@projects/FETCH_CLOCKIFY_PROJECTS_FAILURE",
)<string, MappedEntityRecordsModel<ProjectModel>, void>();

export const fetchTogglProjects = createAsyncAction(
  "@projects/FETCH_TOGGL_PROJECTS_REQUEST",
  "@projects/FETCH_TOGGL_PROJECTS_SUCCESS",
  "@projects/FETCH_TOGGL_PROJECTS_FAILURE",
)<string, MappedEntityRecordsModel<ProjectModel>, void>();

export const flipIsProjectIncluded = createAction("@projects/FLIP_IS_INCLUDED")<
  string
>();
