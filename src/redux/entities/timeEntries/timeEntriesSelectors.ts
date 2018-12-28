import { createSelector } from 'reselect';
import { TimeEntryModel } from '../../../types/timeEntriesTypes';
import { State } from '../../rootReducer';

export const selectTogglTimeEntryRecords = createSelector(
  (state: State) => state.entities.timeEntries.toggl.timeEntriesById,
  (timeEntriesById): TimeEntryModel[] => Object.values(timeEntriesById),
);
