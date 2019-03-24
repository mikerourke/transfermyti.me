import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { ClientModel } from '~/types/clientsTypes';
import { CreateNamedEntityRequest, ReduxState } from '~/types/commonTypes';

export const selectTogglClients = createSelector(
  (state: ReduxState) => state.entities.clients.toggl.byId,
  (clientsById): ClientModel[] => Object.values(clientsById),
);

export const selectTogglClientsByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglClients,
    (clients): Record<string, ClientModel[]> => {
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
  ): CreateNamedEntityRequest[] => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as ClientModel[];
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { name }) => [...acc, { name }], []);
  },
);
