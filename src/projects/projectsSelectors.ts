import { createSelector } from "reselect";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { ProjectModel } from "~/projects/projectsTypes";

export const selectIfProjectsFetching = (state: ReduxState): boolean =>
  state.projects.isFetching;

export const selectSourceProjects = createSelector(
  (state: ReduxState) => state.projects.source,
  (projectsById): ProjectModel[] => Object.values(projectsById),
);

const filterProjectsByWorkspaceId = (
  projects: ProjectModel[],
  workspaceId: string,
): ProjectModel[] =>
  projects.filter(project => project.workspaceId === workspaceId);

export const selectSourceProjectsForTransfer = createSelector(
  selectSourceProjects,
  (sourceProjects): ProjectModel[] =>
    sourceProjects.filter(project => project.isIncluded),
);

export const selectSourceProjectsInActiveWorkspace = createSelector(
  selectSourceProjects,
  selectActiveWorkspaceId,
  (sourceProjects, activeWorkspaceId) =>
    filterProjectsByWorkspaceId(sourceProjects, activeWorkspaceId),
);
