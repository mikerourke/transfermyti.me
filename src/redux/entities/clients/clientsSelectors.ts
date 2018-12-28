import { createSelector } from 'reselect';
import { ClientModel } from '../../../types/clientsTypes';
import { State } from '../../rootReducer';

export const selectTogglClientRecords = createSelector(
  (state: State) => state.entities.clients.toggl.clientsById,
  (clientsById): ClientModel[] => Object.values(clientsById),
);
