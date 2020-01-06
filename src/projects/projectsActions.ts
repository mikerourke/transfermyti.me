import { createAction, createAsyncAction } from "typesafe-actions";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { ProjectsByIdModel } from "./projectsTypes";

export const createProjects = createAsyncAction(
  "@projects/CREATE_PROJECTS_REQUEST",
  "@projects/CREATE_PROJECTS_SUCCESS",
  "@projects/CREATE_PROJECTS_FAILURE",
)<void, Record<Mapping, ProjectsByIdModel>, void>();

export const fetchProjects = createAsyncAction(
  "@projects/FETCH_PROJECTS_REQUEST",
  "@projects/FETCH_PROJECTS_SUCCESS",
  "@projects/FETCH_PROJECTS_FAILURE",
)<void, Record<Mapping, ProjectsByIdModel>, void>();

export const flipIsProjectIncluded = createAction("@projects/FLIP_IS_INCLUDED")<
  string
>();

export const updateAreAllProjectsIncluded = createAction(
  "@projects/UPDATE_ARE_ALL_INCLUDED",
)<boolean>();

export const updateIsProjectIncluded = createAction(
  "@projects/UPDATE_IS_INCLUDED",
)<{ id: string; isIncluded: boolean }>();
