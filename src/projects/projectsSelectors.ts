import { createSelector } from "reselect";
import * as R from "ramda";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { TableViewModel } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { ProjectModel, ProjectsByIdModel } from "./projectsTypes";

export const sourceProjectsByIdSelector = createSelector(
  (state: ReduxState) => state.projects.source,
  (sourceProjectsById): ProjectsByIdModel => sourceProjectsById,
);

export const sourceProjectsSelector = createSelector(
  sourceProjectsByIdSelector,
  (sourceProjectsById): ProjectModel[] => Object.values(sourceProjectsById),
);

export const targetProjectsByIdSelector = createSelector(
  (state: ReduxState) => state.projects.target,
  (targetProjectsById): ProjectsByIdModel => targetProjectsById,
);

const targetProjectsSelector = createSelector(
  targetProjectsByIdSelector,
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

export const projectsForInclusionsTableSelector = createSelector(
  (state: ReduxState) => state.allEntities.areExistsInTargetShown,
  sourceProjectsInActiveWorkspaceSelector,
  targetProjectsByIdSelector,
  sourceTimeEntryCountByIdFieldSelectorFactory("projectId"),
  (
    areExistsInTargetShown,
    sourceProjects,
    targetProjectsById,
    timeEntryCountByProjectId,
  ): TableViewModel<ProjectModel>[] =>
    sourceProjects.reduce((acc, sourceProject) => {
      const existsInTarget = sourceProject.linkedId !== null;
      if (existsInTarget && !areExistsInTargetShown) {
        return acc;
      }

      let isActiveInTarget = false;
      if (existsInTarget) {
        const targetId = sourceProject.linkedId as string;
        isActiveInTarget = targetProjectsById[targetId].isActive;
      }

      const entryCount = R.propOr<number, Record<string, number>, number>(
        0,
        sourceProject.id,
        timeEntryCountByProjectId,
      );

      return [
        ...acc,
        {
          ...sourceProject,
          entryCount,
          existsInTarget,
          isActiveInSource: sourceProject.isActive,
          isActiveInTarget,
        },
      ];
    }, [] as TableViewModel<ProjectModel>[]),
);

export const projectsTotalCountsByTypeSelector = createSelector(
  projectsForInclusionsTableSelector,
  projectsForTableView =>
    projectsForTableView.reduce(
      (
        acc,
        {
          entryCount,
          isIncluded,
          isActiveInSource,
          isActiveInTarget,
        }: TableViewModel<ProjectModel>,
      ) => ({
        entries: acc.entries + entryCount,
        activeInSource: acc.activeInSource + (isActiveInSource ? 1 : 0),
        activeInTarget: acc.activeInSource + (isActiveInTarget ? 1 : 0),
        inclusions: acc.inclusions + (isIncluded ? 1 : 0),
      }),
      {
        entries: 0,
        activeInSource: 0,
        activeInTarget: 0,
        inclusions: 0,
      },
    ),
);

const groupProjectsByWorkspaceId = (
  projects: ProjectModel[],
): Record<string, ProjectModel[]> => {
  const projectsByWorkspaceId: Record<string, ProjectModel[]> = {};

  for (const project of projects) {
    const workspaceProjects = R.propOr<
      ProjectModel[],
      Record<string, ProjectModel[]>,
      ProjectModel[]
    >([], project.workspaceId, projectsByWorkspaceId);

    projectsByWorkspaceId[project.workspaceId] = [
      ...workspaceProjects,
      project,
    ];
  }

  return projectsByWorkspaceId;
};

export const projectsByWorkspaceIdByToolNameSelector = createSelector(
  toolNameByMappingSelector,
  sourceProjectsSelector,
  targetProjectsSelector,
  (toolNameByMapping, sourceProjects, targetProjects) => ({
    [toolNameByMapping.source]: groupProjectsByWorkspaceId(sourceProjects),
    [toolNameByMapping.target]: groupProjectsByWorkspaceId(targetProjects),
  }),
);
