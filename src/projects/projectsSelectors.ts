import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { ProjectModel, ProjectsByIdModel } from "~/projects/projectsTypes";

export const selectSourceProjectsById = createSelector(
  (state: ReduxState) => state.projects.source,
  (sourceProjectsById): ProjectsByIdModel => sourceProjectsById,
);

export const selectSourceProjects = createSelector(
  selectSourceProjectsById,
  (sourceProjectsById): ProjectModel[] => Object.values(sourceProjectsById),
);

export const selectTargetProjects = createSelector(
  (state: ReduxState) => state.projects.target,
  (targetProjectsById): ProjectModel[] => Object.values(targetProjectsById),
);

export const selectIncludedSourceProjects = createSelector(
  selectSourceProjects,
  (sourceProjects): ProjectModel[] =>
    sourceProjects.filter(sourceProject => sourceProject.isIncluded),
);

export const selectSourceProjectsForTransfer = createSelector(
  selectIncludedSourceProjects,
  (sourceProjects): ProjectModel[] =>
    sourceProjects.filter(sourceProject => R.isNil(sourceProject.linkedId)),
);

export const selectSourceProjectsInActiveWorkspace = createSelector(
  selectSourceProjects,
  selectActiveWorkspaceId,
  (sourceProjects, activeWorkspaceId) =>
    sourceProjects.filter(
      sourceProject => sourceProject.workspaceId === activeWorkspaceId,
    ),
);

export const selectTargetProjectId = createSelector(
  selectSourceProjectsById,
  (_: ReduxState, sourceProjectId: string) => sourceProjectId,
  (sourceProjectsById, sourceProjectId): string | null =>
    R.pathOr<null>(null, [sourceProjectId, "linkedId"], sourceProjectsById),
);
