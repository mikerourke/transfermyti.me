import { isNil, pluck, propOr } from "ramda";

import { selectIdToLinkedId } from "~/api/selectIdToLinkedId";
import {
  areExistsInTargetShownSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntitiesSelectors";
import { createSelector } from "~/redux/reduxTools";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/redux/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/redux/workspaces/workspacesSelectors";
import type { EntityTableRecord, Project, ReduxState } from "~/typeDefs";

export const sourceProjectsByIdSelector = createSelector(
  (state: ReduxState) => state.projects.source,
  (sourceProjectsById): Dictionary<Project> => sourceProjectsById,
);

export const sourceProjectsSelector = createSelector(
  sourceProjectsByIdSelector,
  (sourceProjectsById): Project[] => Object.values(sourceProjectsById),
);

export const targetProjectsByIdSelector = createSelector(
  (state: ReduxState) => state.projects.target,
  (targetProjectsById): Dictionary<Project> => targetProjectsById,
);

const targetProjectsSelector = createSelector(
  targetProjectsByIdSelector,
  (targetProjectsById): Project[] => Object.values(targetProjectsById),
);

export const includedSourceProjectsSelector = createSelector(
  sourceProjectsSelector,
  (sourceProjects): Project[] =>
    sourceProjects.filter((sourceProject) => sourceProject.isIncluded),
);

export const includedSourceProjectIdsSelector = createSelector(
  includedSourceProjectsSelector,
  (sourceProjects): string[] => pluck("id", sourceProjects),
);

export const sourceProjectsForTransferSelector = createSelector(
  includedSourceProjectsSelector,
  (sourceProjects): Project[] =>
    sourceProjects.filter((sourceProject) => isNil(sourceProject.linkedId)),
);

export const sourceProjectsInActiveWorkspaceSelector = createSelector(
  sourceProjectsSelector,
  activeWorkspaceIdSelector,
  (sourceProjects, activeWorkspaceId) =>
    sourceProjects.filter(
      (sourceProject) => sourceProject.workspaceId === activeWorkspaceId,
    ),
);

export const projectIdToLinkedIdSelector = createSelector(
  sourceProjectsByIdSelector,
  (sourceProjectsById): Dictionary<string> =>
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
  ): EntityTableRecord<Project>[] => {
    const projectTableRecords: EntityTableRecord<Project>[] = [];

    for (const sourceProject of sourceProjects) {
      const existsInTarget = sourceProject.linkedId !== null;

      if (existsInTarget && !areExistsInTargetShown) {
        continue;
      }

      let isActiveInTarget = false;
      if (existsInTarget) {
        const targetId = sourceProject.linkedId as string;

        isActiveInTarget = targetProjectsById[targetId].isActive;
      }

      const entryCount = propOr<number, Dictionary<number>, number>(
        0,
        sourceProject.id,
        timeEntryCountByProjectId,
      );

      projectTableRecords.push({
        ...sourceProject,
        entryCount,
        existsInTarget,
        isActiveInSource: sourceProject.isActive,
        isActiveInTarget,
      });
    }

    return projectTableRecords;
  },
);

export const projectsTotalCountsByTypeSelector = createSelector(
  projectsForInclusionsTableSelector,
  (projectsForInclusionsTable) =>
    projectsForInclusionsTable.reduce(
      (
        acc,
        {
          entryCount,
          existsInTarget,
          isIncluded,
          isActiveInSource,
          isActiveInTarget,
        }: EntityTableRecord<Project>,
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
  projects: Project[],
): Dictionary<Project[]> {
  const projectsByWorkspaceId: Dictionary<Project[]> = {};

  for (const project of projects) {
    const workspaceProjects = propOr<
      Project[],
      Dictionary<Project[]>,
      Project[]
    >([], project.workspaceId, projectsByWorkspaceId);

    projectsByWorkspaceId[project.workspaceId] = [
      ...workspaceProjects,
      project,
    ];
  }

  return projectsByWorkspaceId;
}
