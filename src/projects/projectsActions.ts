import { createAsyncAction, createAction } from "typesafe-actions";
import { Mapping } from "~/common/commonTypes";
import { ProjectsByIdModel } from "./projectsTypes";

export const createProjects = createAsyncAction(
  "@projects/CREATE_PROJECTS_REQUEST",
  "@projects/CREATE_PROJECTS_SUCCESS",
  "@projects/CREATE_PROJECTS_FAILURE",
)<string, Record<Mapping, ProjectsByIdModel>, void>();

export const fetchProjects = createAsyncAction(
  "@projects/FETCH_PROJECTS_REQUEST",
  "@projects/FETCH_PROJECTS_SUCCESS",
  "@projects/FETCH_PROJECTS_FAILURE",
)<string, Record<Mapping, ProjectsByIdModel>, void>();

export const flipIsProjectIncluded = createAction("@projects/FLIP_IS_INCLUDED")<
  string
>();
