import { createSelector } from 'reselect';
import { get, isNil } from 'lodash';
import { getEntityRecordsByWorkspaceId } from '~/redux/utils';
import { ClientModel } from '~/types/clientsTypes';
import {
  CreateNamedEntityRequest,
  EntityType,
  ReduxState,
} from '~/types/commonTypes';
import { TimeEntryModel } from '~/types/timeEntriesTypes';

const selectTogglClientsById = createSelector(
  (state: ReduxState) => state.entities.clients.toggl.byId,
  (clientsById): Record<string, ClientModel> => clientsById,
);

export const selectTogglClientRecords = createSelector(
  selectTogglClientsById,
  (clientsById): ClientModel[] => Object.values(clientsById),
);

const getClientRecordsByWorkspaceId = (
  clientRecords: ClientModel[],
  timeEntriesById: Record<string, TimeEntryModel>,
  inclusionsOnly: boolean,
): Record<string, ClientModel[]> => {
  const updatedTimeEntriesById = Object.entries(timeEntriesById).reduce(
    (acc, [timeEntryId, timeEntryRecord]) => {
      const client = clientRecords.find(
        clientRecord => clientRecord.name === timeEntryRecord.client,
      );
      const clientId = isNil(client) ? null : client.id;

      return {
        ...acc,
        [timeEntryId]: {
          ...timeEntryRecord,
          clientId,
        },
      };
    },
    {},
  );

  return getEntityRecordsByWorkspaceId(
    EntityType.Client,
    clientRecords,
    updatedTimeEntriesById,
    inclusionsOnly,
  );
};

export const selectTogglClientsByWorkspaceId = createSelector(
  [
    selectTogglClientRecords,
    (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  ],
  (clientRecords, timeEntriesById): Record<string, ClientModel[]> =>
    getClientRecordsByWorkspaceId(clientRecords, timeEntriesById, false),
);

export const selectTogglClientInclusionsByWorkspaceId = createSelector(
  [
    selectTogglClientRecords,
    (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  ],
  (clientRecords, timeEntriesById): Record<string, ClientModel[]> =>
    getClientRecordsByWorkspaceId(clientRecords, timeEntriesById, true),
);

export const selectClientsTransferPayloadForWorkspace = createSelector(
  [
    selectTogglClientInclusionsByWorkspaceId,
    (_: null, workspaceId: string) => workspaceId,
  ],
  (inclusionsByWorkspaceId, workspaceIdToGet): CreateNamedEntityRequest[] => {
    const includedRecords = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as ClientModel[];
    if (includedRecords.length === 0) return [];

    return includedRecords.reduce((acc, { name }) => [...acc, { name }], []);
  },
);
