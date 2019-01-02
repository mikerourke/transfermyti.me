import { createSelector } from 'reselect';
import isNil from 'lodash/isNil';
import ReduxEntity from '../../../utils/ReduxEntity';
import { ClientModel } from '../../../types/clientsTypes';
import { EntityType } from '../../../types/commonTypes';
import { State } from '../../rootReducer';

export const selectTogglClientsById = createSelector(
  (state: State) => state.entities.clients.toggl.clientsById,
  clientsById => clientsById,
);

export const selectTogglClientRecords = createSelector(
  selectTogglClientsById,
  (clientsById): ClientModel[] => Object.values(clientsById),
);

export const selectTogglClientRecordsByWorkspaceId = createSelector(
  [
    selectTogglClientRecords,
    (state: State) => state.entities.timeEntries.toggl.timeEntriesById,
  ],
  (clientRecords, timeEntriesById): Record<string, ClientModel[]> => {
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

    return ReduxEntity.getRecordsByWorkspaceId(
      EntityType.Client,
      clientRecords,
      updatedTimeEntriesById,
    );
  },
);
