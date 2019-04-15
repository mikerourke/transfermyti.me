import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import * as utils from '~/redux/utils';
import { togglTimeEntriesFetch } from '~/redux/entities/timeEntries/timeEntriesActions';
import * as tasksActions from './tasksActions';
import {
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup, EntityType } from '~/types/entityTypes';
import {
  ClockifyTaskModel,
  ClockifyTaskStatus,
  CompoundTaskModel,
  TogglTaskModel,
} from '~/types/tasksTypes';
import { TogglTimeEntryModel } from '~/types/timeEntriesTypes';

export interface TasksState {
  readonly clockify: ReduxStateEntryForTool<CompoundTaskModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundTaskModel>;
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

const convertSecondsToClockifyEstimate = (seconds: number): string => {
  const minutes = seconds / 60;
  if (minutes < 60) return `PT${minutes}M`;

  const hours = minutes / 60;
  return `PT${hours}H`;
};

const schemaProcessStrategy = (
  value: ClockifyTaskModel | TogglTaskModel,
): CompoundTaskModel => ({
  id: value.id.toString(),
  name: value.name,
  estimate:
    'estimated_seconds' in value
      ? convertSecondsToClockifyEstimate(value.estimated_seconds)
      : value.estimate,
  workspaceId: '', // The workspaceId value is assigned in the selector.
  projectId: utils.findIdFieldValue(value, EntityType.Project),
  assigneeId: utils.findIdFieldValue(value, EntityType.User),
  isActive:
    'active' in value
      ? value.active
      : value.status === ClockifyTaskStatus.Active,
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
  type: EntityType.Task,
});

export const tasksReducer = handleActions(
  {
    [combineActions(
      getType(tasksActions.clockifyTasksFetch.success),
      getType(tasksActions.clockifyTasksTransfer.success),
    )]: (
      state: TasksState,
      { payload: tasks }: ReduxAction<Array<ClockifyTaskModel>>,
    ): TasksState => {
      const normalizedState = utils.normalizeState(
        ToolName.Clockify,
        EntityGroup.Tasks,
        state,
        tasks,
        schemaProcessStrategy,
      );

      return utils.linkEntitiesInStateByName(
        EntityGroup.Tasks,
        normalizedState,
      );
    },

    [getType(tasksActions.togglTasksFetch.success)]: (
      state: TasksState,
      { payload: tasks }: ReduxAction<Array<TogglTaskModel>>,
    ): TasksState =>
      utils.normalizeState(
        ToolName.Toggl,
        EntityGroup.Tasks,
        state,
        tasks,
        schemaProcessStrategy,
      ),

    [combineActions(
      getType(tasksActions.clockifyTasksFetch.request),
      getType(tasksActions.togglTasksFetch.request),
      getType(tasksActions.clockifyTasksTransfer.request),
    )]: (state: TasksState): TasksState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(tasksActions.clockifyTasksFetch.success),
      getType(tasksActions.clockifyTasksFetch.failure),
      getType(tasksActions.togglTasksFetch.success),
      getType(tasksActions.togglTasksFetch.failure),
      getType(tasksActions.clockifyTasksTransfer.success),
      getType(tasksActions.clockifyTasksTransfer.failure),
    )]: (state: TasksState): TasksState => ({
      ...state,
      isFetching: false,
    }),

    [getType(tasksActions.flipIsTaskIncluded)]: (
      state: TasksState,
      { payload: taskId }: ReduxAction<string>,
    ): TasksState => utils.flipEntityInclusion(state, EntityType.Task, taskId),

    [getType(togglTimeEntriesFetch.success)]: (
      state: TasksState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntryModel>>,
    ) =>
      utils.appendEntryCountToState(
        EntityType.Task,
        ToolName.Toggl,
        state,
        timeEntries,
      ),
  },
  initialState,
);
