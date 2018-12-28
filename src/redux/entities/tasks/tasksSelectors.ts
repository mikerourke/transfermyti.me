import { createSelector } from 'reselect';
import { TaskModel } from '../../../types/tasksTypes';
import { State } from '../../rootReducer';

export const selectTogglTaskRecords = createSelector(
  (state: State) => state.entities.tasks.toggl.tasksById,
  (tasksById): TaskModel[] => Object.values(tasksById),
);
