import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type { Mapping, Project } from "~/types";

export const areAllProjectsIncludedUpdated = createAction<boolean>(
  "@projects/areAllProjectsIncludedUpdated",
);

export const isProjectIncludedToggled = createAction<string>(
  "@projects/isProjectIncludedToggled",
);

export const isProjectIncludedUpdated = createAction<{
  id: string;
  isIncluded: boolean;
}>("@projects/isProjectIncludedUpdated");

export const createProjects = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Project>>,
  undefined
>("@projects/createProjects");

export const deleteProjects = createAsyncAction<
  undefined,
  undefined,
  undefined
>("@projects/deleteProjects");

export const fetchProjects = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Project>>,
  undefined
>("@projects/fetchProjects");
