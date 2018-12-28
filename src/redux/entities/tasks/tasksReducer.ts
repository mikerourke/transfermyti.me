import { handleActions, combineActions } from 'redux-actions';
import { normalize, schema } from 'normalizr';
import get from 'lodash/get';
import {
  clockifyTasksFetchStarted,
  clockifyTasksFetchSuccess,
  clockifyTasksFetchFailure,
  togglTasksFetchStarted,
  togglTasksFetchSuccess,
  togglTasksFetchFailure,
} from './tasksActions';
import { TaskModel } from '../../../types/tasksTypes';

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

const tasksSchema = new schema.Entity(
  'tasks',
  {},
  {
    idAttribute: value => value.id.toString(),
    processStrategy: value => ({
      id: value.id.toString(),
      name: value.name,
      estimate:
        'estimated_seconds' in value
          ? getEstimateFromSeconds(value.estimated_seconds)
          : value.estimate,
      projectId: 'pid' in value ? value.pid.toString() : value.projectId,
      assigneeId:
        'uid' in value ? value.uid.toString() : get(value, 'assigneeId', null),
      isActive: 'active' in value ? value.active : value.status === 'ACTIVE',
      isIncluded: true,
    }),
  },
);

export default handleActions(
  {
    [clockifyTasksFetchSuccess]: (
      state: TasksState,
      { payload }: any,
    ): TasksState => {
      const { entities, result } = normalize(payload, [tasksSchema]);
      return {
        ...state,
        clockify: {
          ...state.clockify,
          tasksById: entities.tasks,
          taskIds: result,
        },
      };
    },

    [togglTasksFetchSuccess]: (
      state: TasksState,
      { payload }: any,
    ): TasksState => {
      const { entities, result } = normalize(payload, [tasksSchema]);
      return {
        ...state,
        toggl: {
          ...state.toggl,
          tasksById: entities.tasks,
          taskIds: result,
        },
      };
    },

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
  },
  initialState,
);
