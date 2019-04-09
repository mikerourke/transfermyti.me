import { createSelector } from 'reselect';
import { get, isNil } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { ReduxState } from '~/types/commonTypes';
import {
  ClockifyEstimateType,
  CreateProjectRequest,
  ProjectModel,
} from '~/types/projectsTypes';

export const selectClockifyProjectIds = createSelector(
  (state: ReduxState) => state.entities.projects.clockify.idValues,
  (projectIds): Array<string> => projectIds,
);

export const selectClockifyProjectsById = createSelector(
  (state: ReduxState) => state.entities.projects.clockify.byId,
  (projectsById): Record<string, ProjectModel> => projectsById,
);

export const selectClockifyProjectsByWorkspace = createSelector(
  (state: ReduxState) => Object.values(state.entities.projects.clockify.byId),
  projects => groupByWorkspace(projects),
);

export const selectTogglProjectsById = createSelector(
  (state: ReduxState) => state.entities.projects.toggl.byId,
  projectsById => projectsById,
);

export const selectTogglProjectsByWorkspaceFactory = (
  inclusionsOnly: boolean,
) =>
  createSelector(
    (state: ReduxState) => Object.values(state.entities.projects.toggl.byId),
    (projects): Record<string, ProjectModel[]> => {
      const projectsToUse = inclusionsOnly
        ? findTogglInclusions(projects)
        : projects;
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
