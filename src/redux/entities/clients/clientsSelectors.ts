import { createSelector } from 'reselect';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { getEntityRecordsByWorkspaceId } from '../../utils';
import { ClientModel } from '../../../types/clientsTypes';
import {
  CreateNamedEntityRequest,
  EntityType,
} from '../../../types/commonTypes';
import { TimeEntryModel } from '../../../types/timeEntriesTypes';
import { State } from '../../rootReducer';

const selectClockifyClientsById = createSelector(
  (state: State) => state.entities.clients.clockify.byId,
  (clientsById): Record<string, ClientModel> => clientsById,
);

const selectTogglClientsById = createSelector(
  (state: State) => state.entities.clients.toggl.byId,
  (clientsById): Record<string, ClientModel> => clientsById,
);

export const selectClockifyClientRecords = createSelector(
  selectClockifyClientsById,
  (clockifyClientsById): ClientModel[] => Object.values(clockifyClientsById),
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

export const selectClockifyClientsByWorkspaceId = createSelector(
  [
    selectClockifyClientRecords,
    (state: State) => state.entities.timeEntries.clockify.byId,
  ],
  (clockifyClientRecords, timeEntriesById): Record<string, ClientModel[]> =>
    getClientRecordsByWorkspaceId(
      clockifyClientRecords,
      timeEntriesById,
      false,
    ),
);

export const selectTogglClientsByWorkspaceId = createSelector(
  [
    selectTogglClientRecords,
    (state: State) => state.entities.timeEntries.toggl.byId,
  ],
  (clientRecords, timeEntriesById): Record<string, ClientModel[]> =>
    getClientRecordsByWorkspaceId(clientRecords, timeEntriesById, false),
);

export const selectTogglClientInclusionsByWorkspaceId = createSelector(
  [
    selectTogglClientRecords,
    (state: State) => state.entities.timeEntries.toggl.byId,
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
