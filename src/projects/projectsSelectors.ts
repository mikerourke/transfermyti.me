import { createSelector } from "reselect";
import * as R from "ramda";
import { selectIdToLinkedId } from "~/redux/reduxUtils";
import {
  areExistsInTargetShownSelector,
  toolNameByMappingSelector,
} from "~/allEntities/allEntitiesSelectors";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import {
  ReduxState,
  ProjectModel,
  ProjectsByIdModel,
  TableViewModel,
} from "~/typeDefs";

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

export const includedSourceProjectIdsSelector = createSelector(
  includedSourceProjectsSelector,
  (sourceProjects): string[] => R.pluck("id", sourceProjects),
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
  (sourceProjectsById): Record<string, string> =>
    selectIdToLinkedId(sourceProjectsById),
);

export const projectsForInclusionsTableSelector = createSelector(
  areExistsInTargetShownSelector,
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
  projectsForInclusionsTable =>
    projectsForInclusionsTable.reduce(
      (
        acc,
        {
          entryCount,
          existsInTarget,
          isIncluded,
          isActiveInSource,
          isActiveInTarget,
        }: TableViewModel<ProjectModel>,
      ) => ({
        entryCount: acc.entryCount + entryCount,
        existsInTarget: acc.existsInTarget + (existsInTarget ? 1 : 0),
        isActiveInSource: acc.isActiveInSource + (isActiveInSource ? 1 : 0),
        isActiveInTarget: acc.isActiveInTarget + (isActiveInTarget ? 1 : 0),
        isIncluded: acc.isIncluded + (isIncluded ? 1 : 0),
      }),
      {
        entryCount: 0,
        existsInTarget: 0,
        isActiveInSource: 0,
        isActiveInTarget: 0,
        isIncluded: 0,
      },
    ),
);

export const projectsByWorkspaceIdByToolNameSelector = createSelector(
  toolNameByMappingSelector,
  sourceProjectsSelector,
  targetProjectsSelector,
  (toolNameByMapping, sourceProjects, targetProjects) => ({
    [toolNameByMapping.source]: groupProjectsByWorkspaceId(sourceProjects),
    [toolNameByMapping.target]: groupProjectsByWorkspaceId(targetProjects),
  }),
);

function groupProjectsByWorkspaceId(
  projects: ProjectModel[],
): Record<string, ProjectModel[]> {
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
}
