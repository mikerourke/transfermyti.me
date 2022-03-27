import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, Project } from "~/typeDefs";

export const createProjects = createAsyncAction(
  "@projects/createProjectsRequest",
  "@projects/createProjectsSuccess",
  "@projects/createProjectsFailure",
)<undefined, Record<Mapping, Dictionary<Project>>, undefined>();

export const deleteProjects = createAsyncAction(
  "@projects/deleteProjectsRequest",
  "@projects/deleteProjectsSuccess",
  "@projects/deleteProjectsFailure",
)<undefined, undefined, undefined>();

export const fetchProjects = createAsyncAction(
  "@projects/fetchProjectsRequest",
  "@projects/fetchProjectsSuccess",
  "@projects/fetchProjectsFailure",
)<undefined, Record<Mapping, Dictionary<Project>>, undefined>();

export const isProjectIncludedToggled = createAction(
  "@projects/isProjectIncludedToggled",
)<string>();

export const isProjectIncludedUpdated = createAction(
  "@projects/isProjectIncludedUpdated",
)<{ id: string; isIncluded: boolean }>();

export const areAllProjectsIncludedUpdated = createAction(
  "@projects/areAllProjectsIncludedUpdated",
)<boolean>();
