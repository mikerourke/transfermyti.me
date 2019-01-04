import { combineActions, handleActions } from 'redux-actions';
import {
  getEntityIdFieldValue,
  getEntityNormalizedState,
  updateIsEntityIncluded,
} from '../../utils';
import {
  clockifyTasksFetchFailure,
  clockifyTasksFetchStarted,
  clockifyTasksFetchSuccess,
  togglTasksFetchFailure,
  togglTasksFetchStarted,
  togglTasksFetchSuccess,
  updateIsTaskIncluded,
} from './tasksActions';
import { EntityType, ToolName } from '../../../types/commonTypes';
import { ClockifyTask, TaskModel, TogglTask } from '../../../types/tasksTypes';
import { ReduxAction } from '../../rootReducer';

interface TasksEntryForTool {
  readonly tasksById: Record<string, TaskModel>;
  readonly taskIds: string[];
}

export interface TasksState {
  readonly clockify: TasksEntryForTool;
  readonly toggl: TasksEntryForTool;
  readonly isFetching: boolean;
}

export const initialState: TasksState = {
  clockify: {
    tasksById: {},
    taskIds: [],
  },
  toggl: {
    tasksById: {},
    taskIds: [],
  },
  isFetching: false,
};

const getEstimateFromSeconds = (seconds: number): string => {
  const minutes = seconds / 60;
  if (minutes < 60) return `PT${minutes}M`;

  const hours = minutes / 60;
  return `PT${hours}H`;
};

const schemaProcessStrategy = (value: ClockifyTask | TogglTask): TaskModel => ({
  id: value.id.toString(),
  name: value.name,
  estimate:
    'estimated_seconds' in value
      ? getEstimateFromSeconds(value.estimated_seconds)
      : value.estimate,
  workspaceId: '', // The workspaceId value is assigned in the selector.
  projectId: getEntityIdFieldValue(value, EntityType.Project),
  assigneeId: getEntityIdFieldValue(value, EntityType.User),
  isActive: 'active' in value ? value.active : value.status === 'ACTIVE',
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [clockifyTasksFetchSuccess]: (
      state: TasksState,
      { payload: tasks }: ReduxAction<ClockifyTask[]>,
    ): TasksState =>
      getEntityNormalizedState<TasksState, ClockifyTask[]>(
        ToolName.Clockify,
        EntityType.Task,
        schemaProcessStrategy,
        state,
        tasks,
      ),

    [togglTasksFetchSuccess]: (
      state: TasksState,
      { payload: tasks }: ReduxAction<TogglTask[]>,
    ): TasksState =>
      getEntityNormalizedState<TasksState, TogglTask[]>(
        ToolName.Toggl,
        EntityType.Task,
        schemaProcessStrategy,
        state,
        tasks,
      ),

    [combineActions(clockifyTasksFetchStarted, togglTasksFetchStarted)]: (
      state: TasksState,
    ): TasksState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyTasksFetchSuccess,
      clockifyTasksFetchFailure,
      togglTasksFetchSuccess,
      togglTasksFetchFailure,
    )]: (state: TasksState): TasksState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsTaskIncluded]: (
      state: TasksState,
      { payload: taskId }: ReduxAction<string>,
    ): TasksState =>
      updateIsEntityIncluded<TasksState>(state, EntityType.Task, taskId),
  },
  initialState,
);
