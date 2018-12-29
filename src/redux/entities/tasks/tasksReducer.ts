import { combineActions, handleActions } from 'redux-actions';
import ReduxEntity from '../../../utils/ReduxEntity';
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
  projectId: ReduxEntity.getIdFieldValue(value, EntityType.Project),
  assigneeId: ReduxEntity.getIdFieldValue(value, EntityType.User),
  isActive: 'active' in value ? value.active : value.status === 'ACTIVE',
  isIncluded: true,
});

const reduxEntity = new ReduxEntity(EntityType.Task, schemaProcessStrategy);

export default handleActions(
  {
    [clockifyTasksFetchSuccess]: (
      state: TasksState,
      { payload }: ReduxAction<ClockifyTask[]>,
    ): TasksState =>
      reduxEntity.getNormalizedState<TasksState, ClockifyTask[]>(
        ToolName.Clockify,
        state,
        payload,
      ),

    [togglTasksFetchSuccess]: (
      state: TasksState,
      { payload }: ReduxAction<TogglTask[]>,
    ): TasksState =>
      reduxEntity.getNormalizedState<TasksState, TogglTask[]>(
        ToolName.Clockify,
        state,
        payload,
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
    ): TasksState => reduxEntity.updateIsIncluded<TasksState>(state, taskId),
  },
  initialState,
);
