import { createSelector } from 'reselect';
import get from 'lodash/get';
import ReduxEntity from '../../../utils/ReduxEntity';
import { selectTogglProjectsById } from '../projects/projectsSelectors';
import { EntityType } from '../../../types/commonTypes';
import { TaskModel } from '../../../types/tasksTypes';
import { State } from '../../rootReducer';

export const selectTogglTasksById = createSelector(
  (state: State) => state.entities.tasks.toggl.tasksById,
  tasksById => tasksById,
);

export const selectTogglTaskRecords = createSelector(
  [selectTogglTasksById, selectTogglProjectsById],
  (tasksById, projectsById): TaskModel[] =>
    Object.values(tasksById).map(taskRecord => ({
      ...taskRecord,
      workspaceId: get(projectsById, [taskRecord.projectId, 'workspaceId'], ''),
    })),
);

export const selectTogglTaskRecordsByWorkspaceId = createSelector(
  [
    selectTogglTaskRecords,
    (state: State) => state.entities.timeEntries.toggl.timeEntriesById,
  ],
  (taskRecords, timeEntriesById): Record<string, TaskModel[]> =>
    ReduxEntity.getRecordsByWorkspaceId(
      EntityType.Task,
      taskRecords,
      timeEntriesById,
    ),
);
