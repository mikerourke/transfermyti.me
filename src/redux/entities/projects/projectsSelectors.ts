import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import {
  ClockifyEstimateType,
  CompoundProjectModel,
  CreateProjectRequestModel,
  ReduxState,
} from '~/types';

export const selectClockifyProjectIds = createSelector(
  (state: ReduxState) => state.entities.projects.clockify.idValues,
  (projectIds): Array<string> => projectIds,
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
    (projects): Record<string, Array<CompoundProjectModel>> => {
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
  ): Array<CreateProjectRequestModel> => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as Array<CompoundProjectModel>;
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, project) => {
      const matchingClient = get(togglClientsById, project.clientId, {
        isIncluded: false,
        linkedId: null,
      });
      const clientId = matchingClient.isIncluded
        ? matchingClient.linkedId
        : null;

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
