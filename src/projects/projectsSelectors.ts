import * as R from "ramda";
import { createSelector } from "reselect";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { ProjectModel, ProjectsByIdModel } from "~/projects/projectsTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";

export const sourceProjectsByIdSelector = createSelector(
  (state: ReduxState) => state.projects.source,
  (sourceProjectsById): ProjectsByIdModel => sourceProjectsById,
);

const sourceProjectsSelector = createSelector(
  sourceProjectsByIdSelector,
  (sourceProjectsById): ProjectModel[] => Object.values(sourceProjectsById),
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

const targetProjectsByIdSelector = createSelector(
  (state: ReduxState) => state.projects.target,
  (targetProjectsById): ProjectsByIdModel => targetProjectsById,
);

const targetProjectsSelector = createSelector(
  targetProjectsByIdSelector,
  (targetProjectsById): ProjectModel[] => Object.values(targetProjectsById),
);

export const projectIdToLinkedIdSelector = createSelector(
  sourceProjectsByIdSelector,
  sourceProjectsById => {
    const projectIdToLinkedId: Record<string, string> = {};

    for (const [id, project] of Object.entries(sourceProjectsById)) {
      if (!R.isNil(project.linkedId)) {
        projectIdToLinkedId[id] = project.linkedId;
        projectIdToLinkedId[project.linkedId] = project.id;
      }
    }

    return projectIdToLinkedId;
  },
);

export const projectsByToolNameSelector = createSelector(
  toolNameByMappingSelector,
  sourceProjectsSelector,
  targetProjectsSelector,
  (toolNameByMapping, sourceProjects, targetProjects) => ({
    [toolNameByMapping[Mapping.Source]]: sourceProjects,
    [toolNameByMapping[Mapping.Target]]: targetProjects,
  }),
);
