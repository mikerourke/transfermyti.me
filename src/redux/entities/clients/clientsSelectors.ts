import { createSelector } from 'reselect';
import { get, isNil } from 'lodash';
import {
  appendTimeEntryCount,
  findTogglInclusions,
  groupByWorkspace,
} from '~/redux/utils';
import { selectTogglTimeEntriesById } from '~/redux/entities/timeEntries/timeEntriesSelectors';
import { ClientModel } from '~/types/clientsTypes';
import { CreateNamedEntityRequest, ReduxState } from '~/types/commonTypes';
import { EntityType } from '~/types/entityTypes';
import { TimeEntryModel } from '~/types/timeEntriesTypes';

export const selectTogglClients = createSelector(
  (state: ReduxState) => state.entities.clients.toggl.byId,
  (clientsById): ClientModel[] => Object.values(clientsById),
);

const appendClientToTimeEntries = (
  clients: ClientModel[],
  timeEntriesById: Record<string, TimeEntryModel>,
) =>
  Object.entries(timeEntriesById).reduce((acc, [id, timeEntry]) => {
    const matchingClient = clients.find(
      ({ name }) => name === timeEntry.client,
    );
    const clientId = isNil(matchingClient) ? null : matchingClient.id;

    return {
      ...acc,
      [id]: { ...timeEntry, clientId },
    };
  }, {});

export const selectTogglClientsByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglClients,
    selectTogglTimeEntriesById,
    (clients, timeEntriesById): Record<string, ClientModel[]> => {
      const timeEntriesWithClient = appendClientToTimeEntries(
        clients,
        timeEntriesById,
      );

      const clientsWithEntryCounts = appendTimeEntryCount(
        EntityType.Client,
        clients,
        timeEntriesWithClient,
      );

      const clientsToUse = inclusionsOnly
        ? findTogglInclusions(clientsWithEntryCounts)
        : clientsWithEntryCounts;
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
