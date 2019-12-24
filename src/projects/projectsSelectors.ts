import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { ProjectModel } from "~/projects/projectsTypes";

export const selectSourceProjectsById = createSelector(
  (state: ReduxState) => state.projects.source,
  sourceProjectsById => sourceProjectsById,
);

export const selectSourceProjectIds = createSelector(
  selectSourceProjectsById,
  (projectsById): string[] => Object.keys(projectsById),
);

export const selectTargetProjectsById = createSelector(
  (state: ReduxState) => state.projects.target,
  targetProjectsById => targetProjectsById,
);

const selectTargetProjects = createSelector(
  selectTargetProjectsById,
  targetProjectsById => Object.values(targetProjectsById),
);

const selectTargetProjectsInWorkspace = createSelector(
  selectTargetProjects,
  (_: unknown, workspaceId: string) => workspaceId,
  (targetProjects, workspaceId): ProjectModel[] =>
    targetProjects.filter(project => project.workspaceId === workspaceId),
);

export const selectTargetProjectsForTransfer = createSelector(
  selectTargetProjectsInWorkspace,
  targetProjects => targetProjects.filter(project => project.isIncluded),
);
