import { createSelector } from 'reselect';
import { get, isNil } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { CompoundClientModel, EntityWithName, ReduxState } from '~/types';

const selectTogglClientsById = createSelector(
  (state: ReduxState) => state.entities.clients.toggl.byId,
  (clientsById): Record<string, CompoundClientModel> => clientsById,
);

export const selectTogglClients = createSelector(
  selectTogglClientsById,
  (clientsById): Array<CompoundClientModel> => Object.values(clientsById),
);

export const selectTogglClientsByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglClients,
    (clients): Record<string, Array<CompoundClientModel>> => {
      const clientsToUse = inclusionsOnly
        ? findTogglInclusions(clients)
        : clients;
      return groupByWorkspace(clientsToUse);
    },
  );

export const selectClientsTransferPayloadForWorkspace = createSelector(
  selectTogglClientsByWorkspaceFactory(true),
  inclusionsByWorkspace => (
    workspaceIdToGet: string,
  ): Array<EntityWithName> => {
    const inclusions = get(
      inclusionsByWorkspace,
      workspaceIdToGet,
      [],
    ) as Array<CompoundClientModel>;
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { name }) => [...acc, { name }], []);
  },
);

export const selectTogglClientMatchingId = createSelector(
  selectTogglClientsById,
  clientsById => (idToMatch: string): Partial<CompoundClientModel> => {
    const matchingClient = get(clientsById, idToMatch, null);

    if (isNil(matchingClient)) {
      return { linkedId: null, isIncluded: false };
    }

    return matchingClient;
  },
);
