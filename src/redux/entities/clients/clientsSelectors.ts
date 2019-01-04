import { createSelector } from 'reselect';
import isNil from 'lodash/isNil';
import {
  setLinkedIdInEntities,
  getEntityRecordsByWorkspaceId,
} from '../../utils';
import { ClientModel } from '../../../types/clientsTypes';
import { EntityType } from '../../../types/commonTypes';
import { State } from '../../rootReducer';

const selectClockifyClientsById = createSelector(
  (state: State) => state.entities.clients.clockify.clientsById,
  clientsById => clientsById,
);

const selectTogglClientsById = createSelector(
  (state: State) => state.entities.clients.toggl.clientsById,
  clientsById => clientsById,
);

export const selectClockifyLinkedClientsById = createSelector(
  [selectClockifyClientsById, selectTogglClientsById],
  (clockifyClientsById, togglClientsById) =>
    setLinkedIdInEntities(togglClientsById, clockifyClientsById),
);

export const selectTogglLinkedClientsById = createSelector(
  [selectClockifyClientsById, selectTogglClientsById],
  (clockifyClientsById, togglClientsById) =>
    setLinkedIdInEntities(clockifyClientsById, togglClientsById),
);

export const selectClockifyClientRecords = createSelector(
  selectClockifyLinkedClientsById,
  (clockifyClientsById): ClientModel[] => Object.values(clockifyClientsById),
);

export const selectTogglClientRecords = createSelector(
  selectTogglLinkedClientsById,
  (clientsById): ClientModel[] => Object.values(clientsById),
);

export const selectTogglIncludedClientRecords = createSelector(
  selectTogglClientRecords,
  clientRecords => clientRecords.filter(({ isIncluded }) => isIncluded),
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

    return getEntityRecordsByWorkspaceId(
      EntityType.Client,
      clientRecords,
      updatedTimeEntriesById,
    );
  },
);
