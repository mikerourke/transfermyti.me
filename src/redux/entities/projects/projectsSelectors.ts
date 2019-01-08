import { createSelector } from 'reselect';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { getEntityRecordsByWorkspaceId } from '../../utils';
import { EntityType } from '../../../types/commonTypes';
import {
  ClockifyEstimateType,
  CreateProjectRequest,
  ProjectModel,
} from '../../../types/projectsTypes';
import { State } from '../../rootReducer';

export const selectClockifyProjectsById = createSelector(
  (state: State) => state.entities.projects.clockify.byId,
  projectsById => projectsById,
);

export const selectClockifyProjectRecords = createSelector(
  selectClockifyProjectsById,
  (projectsById): ProjectModel[] => Object.values(projectsById),
);

export const selectClockifyProjectIds = createSelector(
  (state: State) => state.entities.projects.clockify.idValues,
  (projectIds): string[] => projectIds,
);

export const selectTogglProjectsById = createSelector(
  (state: State) => state.entities.projects.toggl.byId,
  projectsById => projectsById,
);

export const selectTogglProjectRecords = createSelector(
  selectTogglProjectsById,
  (projectsById): ProjectModel[] => Object.values(projectsById),
);

export const selectClockifyProjectsByWorkspaceId = createSelector(
  [
    selectClockifyProjectRecords,
    (state: State) => state.entities.timeEntries.clockify.byId,
  ],
  (projectRecords, timeEntriesById): Record<string, ProjectModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.Project,
      projectRecords,
      timeEntriesById,
      false,
    ),
);

export const selectTogglProjectsByWorkspaceId = createSelector(
  [
    selectTogglProjectRecords,
    (state: State) => state.entities.timeEntries.toggl.byId,
  ],
  (projectRecords, timeEntriesById): Record<string, ProjectModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.Project,
      projectRecords,
      timeEntriesById,
      false,
    ),
);

export const selectTogglProjectInclusionsByWorkspaceId = createSelector(
  [
    selectTogglProjectRecords,
    (state: State) => state.entities.timeEntries.toggl.byId,
  ],
  (projectRecords, timeEntriesById): Record<string, ProjectModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.Project,
      projectRecords,
      timeEntriesById,
      true,
    ),
);

export const selectProjectsTransferPayloadForWorkspace = createSelector(
  [
    selectTogglProjectInclusionsByWorkspaceId,
    (state: State) => state.entities.clients.toggl.byId,
    (_: null, workspaceId: string) => workspaceId,
  ],
  (
    inclusionsByWorkspaceId,
    togglClientsById,
    workspaceIdToGet,
  ): CreateProjectRequest[] => {
    const includedRecords = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as ProjectModel[];
    if (includedRecords.length === 0) return [];

    return includedRecords.reduce((acc, projectRecord) => {
      const { clientId, ...project } = projectRecord;
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
