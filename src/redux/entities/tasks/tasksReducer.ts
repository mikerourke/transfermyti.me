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
  clockifyTasksTransferFailure,
  clockifyTasksTransferStarted,
  clockifyTasksTransferSuccess,
  togglTasksFetchFailure,
  togglTasksFetchStarted,
  togglTasksFetchSuccess,
  updateIsTaskIncluded,
} from './tasksActions';
import {
  EntityGroup,
  EntityType,
  ReduxStateEntryForTool,
  ToolName,
} from '../../../types/commonTypes';
import {
  ClockifyTask,
  ClockifyTaskStatus,
  TaskModel,
  TogglTask
} from '../../../types/tasksTypes';
import { ReduxAction } from '../../rootReducer';

export interface TasksState {
  readonly clockify: ReduxStateEntryForTool<TaskModel>;
  readonly toggl: ReduxStateEntryForTool<TaskModel>;
  readonly isFetching: boolean;
}

export const initialState: TasksState = {
  clockify: {
    byId: {},
    idValues: [],
  },
  toggl: {
    byId: {},
    idValues: [],
  },
  isFetching: false,
};

const convertSecondsToClockifyEstimate = (
  seconds: number,
): string => {
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
      ? convertSecondsToClockifyEstimate(value.estimated_seconds)
      : value.estimate,
  workspaceId: '', // The workspaceId value is assigned in the selector.
  projectId: getEntityIdFieldValue(value, EntityType.Project),
  assigneeId: getEntityIdFieldValue(value, EntityType.User),
  isActive: 'active' in value ? value.active : value.status === ClockifyTaskStatus.Active,
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [combineActions(clockifyTasksFetchSuccess, clockifyTasksTransferSuccess)]: (
      state: TasksState,
      { payload: tasks }: ReduxAction<ClockifyTask[]>,
    ): TasksState =>
      getEntityNormalizedState(
        ToolName.Clockify,
        EntityGroup.Tasks,
        schemaProcessStrategy,
        state,
        tasks,
      ),

    [togglTasksFetchSuccess]: (
      state: TasksState,
      { payload: tasks }: ReduxAction<TogglTask[]>,
    ): TasksState =>
      getEntityNormalizedState(
        ToolName.Toggl,
        EntityGroup.Tasks,
        schemaProcessStrategy,
        state,
        tasks,
      ),

    [combineActions(
      clockifyTasksFetchStarted,
      togglTasksFetchStarted,
      clockifyTasksTransferStarted,
    )]: (state: TasksState): TasksState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyTasksFetchSuccess,
      clockifyTasksFetchFailure,
      togglTasksFetchSuccess,
      togglTasksFetchFailure,
      clockifyTasksTransferSuccess,
      clockifyTasksTransferFailure,
    )]: (state: TasksState): TasksState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsTaskIncluded]: (
      state: TasksState,
      { payload: taskId }: ReduxAction<string>,
    ): TasksState => updateIsEntityIncluded(state, EntityType.Task, taskId),
  },
  initialState,
);
