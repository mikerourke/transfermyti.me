import { createSelector } from 'reselect';
import { get, isNil } from 'lodash';
import {
  appendTimeEntryCount,
  findTogglInclusions,
  groupByWorkspace,
} from '~/redux/utils';
import { selectTogglTimeEntriesById } from '~/redux/entities/timeEntries/timeEntriesSelectors';
import { ReduxState } from '~/types/commonTypes';
import { EntityType } from '~/types/entityTypes';
import {
  ClockifyEstimateType,
  CreateProjectRequest,
  ProjectModel,
} from '~/types/projectsTypes';

export const selectClockifyProjectIds = createSelector(
  (state: ReduxState) => state.entities.projects.clockify.idValues,
  (projectIds): string[] => projectIds,
);

export const selectTogglProjectsById = createSelector(
  (state: ReduxState) => state.entities.projects.toggl.byId,
  projectsById => projectsById,
);

export const selectTogglProjectsByWorkspaceFactory = (
  inclusionsOnly: boolean,
) =>
  createSelector(
    selectTogglProjectsById,
    selectTogglTimeEntriesById,
    (projectsById, timeEntriesById): Record<string, ProjectModel[]> => {
      const projectsWithEntryCounts = appendTimeEntryCount(
        EntityType.Project,
        Object.values(projectsById),
        timeEntriesById,
      );

      const projectsToUse = inclusionsOnly
        ? findTogglInclusions(projectsWithEntryCounts)
        : projectsWithEntryCounts;
      return groupByWorkspace(projectsToUse);
    },
  );

export const selectProjectsTransferPayloadForWorkspace = createSelector(
  selectTogglProjectsByWorkspaceFactory(true),
  (state: ReduxState) => state.entities.clients.toggl.byId,
  (inclusionsByWorkspaceId, togglClientsById) => (
    workspaceIdToGet: string,
  ): CreateProjectRequest[] => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as ProjectModel[];
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, includedProject) => {
      const { clientId, ...project } = includedProject;
      const clockifyClientId = get(
        togglClientsById,
        [clientId, 'linkedId'],
        null,
      );
      if (isNil(clockifyClientId)) return acc;

      return [
        ...acc,
        {
          clientId,
          name: project.name,
          isPublic: project.isPublic,
          isBillable: project.isBillable,
          color: project.color,
          estimate: {
            estimate: '',
            type: ClockifyEstimateType.Auto,
          },
        },
      ];
    }, []);
  },
);
