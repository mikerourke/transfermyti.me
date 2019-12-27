import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { ProjectModel, ProjectsByIdModel } from "~/projects/projectsTypes";

export const selectSourceProjectsById = createSelector(
  (state: ReduxState) => state.projects.source,
  (projectsById): ProjectsByIdModel => projectsById,
);

export const selectSourceProjects = createSelector(
  selectSourceProjectsById,
  (projectsById): ProjectModel[] => Object.values(projectsById),
);

export const selectSourceProjectsForTransfer = createSelector(
  selectSourceProjects,
  (sourceProjects): ProjectModel[] =>
    sourceProjects.filter(project => project.isIncluded),
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
