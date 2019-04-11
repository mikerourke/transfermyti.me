import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { ClientModel } from '~/types/clientsTypes';
import { CreateNamedEntityRequest, ReduxState } from '~/types/commonTypes';

export const selectClockifyClientsByWorkspace = createSelector(
  (state: ReduxState) => Object.values(state.entities.clients.clockify.byId),
  clients => groupByWorkspace(clients),
);

export const selectTogglClients = createSelector(
  (state: ReduxState) => state.entities.clients.toggl.byId,
  (clientsById): Array<ClientModel> => Object.values(clientsById),
);

export const selectTogglClientsByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglClients,
    (clients): Record<string, Array<ClientModel>> => {
      const clientsToUse = inclusionsOnly
        ? findTogglInclusions(clients)
        : clients;
      return groupByWorkspace(clientsToUse);
    },
  );

export const selectClientsTransferPayloadForWorkspace = createSelector(
  selectTogglClientsByWorkspaceFactory(true),
  inclusionsByWorkspaceId => (
    workspaceIdToGet: string,
  ): Array<CreateNamedEntityRequest> => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as Array<ClientModel>;
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { name }) => [...acc, { name }], []);
  },
);
