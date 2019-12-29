import { createSelector } from "reselect";
import * as R from "ramda";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { ProjectModel, ProjectsByIdModel } from "~/projects/projectsTypes";

export const sourceProjectsByIdSelector = createSelector(
  (state: ReduxState) => state.projects.source,
  (sourceProjectsById): ProjectsByIdModel => sourceProjectsById,
);

export const sourceProjectsSelector = createSelector(
  sourceProjectsByIdSelector,
  (sourceProjectsById): ProjectModel[] => Object.values(sourceProjectsById),
);

export const targetProjectsSelector = createSelector(
  (state: ReduxState) => state.projects.target,
  (targetProjectsById): ProjectModel[] => Object.values(targetProjectsById),
);

export const includedSourceProjectsSelector = createSelector(
  sourceProjectsSelector,
  (sourceProjects): ProjectModel[] =>
    sourceProjects.filter(sourceProject => sourceProject.isIncluded),
);

export const sourceProjectsForTransferSelector = createSelector(
  includedSourceProjectsSelector,
  (sourceProjects): ProjectModel[] =>
    sourceProjects.filter(sourceProject => R.isNil(sourceProject.linkedId)),
);

export const sourceProjectsInActiveWorkspaceSelector = createSelector(
  sourceProjectsSelector,
  activeWorkspaceIdSelector,
  (sourceProjects, activeWorkspaceId) =>
    sourceProjects.filter(
      sourceProject => sourceProject.workspaceId === activeWorkspaceId,
    ),
);

export const targetProjectIdSelector = createSelector(
  sourceProjectsByIdSelector,
  (_: ReduxState, sourceProjectId: string) => sourceProjectId,
  (sourceProjectsById, sourceProjectId): string | null =>
    R.pathOr<null>(null, [sourceProjectId, "linkedId"], sourceProjectsById),
);
