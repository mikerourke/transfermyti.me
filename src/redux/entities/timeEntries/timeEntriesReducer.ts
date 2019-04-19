import { get } from 'lodash';
import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import * as utils from '~/redux/utils';
import { flipIsProjectIncluded } from '~/redux/entities/projects/projectsActions';
import { flipIsTaskIncluded } from '~/redux/entities/tasks/tasksActions';
import { flipIsUserIncluded } from '~/redux/entities/users/usersActions';
import * as timeEntriesActions from './timeEntriesActions';
import {
  ClockifyTimeEntryModel,
  CompoundTimeEntryModel,
  EntityGroup,
  ReduxAction,
  ReduxStateEntryForTool,
  TogglTimeEntryModel,
  ToolName,
} from '~/types';

export interface TimeEntriesState {
  readonly clockify: ReduxStateEntryForTool<CompoundTimeEntryModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundTimeEntryModel>;
  readonly isFetching: boolean;
}

export const initialState: TimeEntriesState = {
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

export const timeEntriesReducer = handleActions(
  {
    [combineActions(
      getType(timeEntriesActions.clockifyTimeEntriesFetch.success),
      getType(timeEntriesActions.clockifyTimeEntriesTransfer.success),
    )]: (
      state: TimeEntriesState,
      { payload: timeEntries }: ReduxAction<Array<ClockifyTimeEntryModel>>,
    ): TimeEntriesState =>
      utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.TimeEntries,
        entityState: state,
        payload: timeEntries,
      }),

    [getType(timeEntriesActions.togglTimeEntriesFetch.success)]: (
      state: TimeEntriesState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntryModel>>,
    ): TimeEntriesState =>
      utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.TimeEntries,
        entityState: state,
        payload: timeEntries,
      }),

    [combineActions(
      getType(timeEntriesActions.clockifyTimeEntriesFetch.request),
      getType(timeEntriesActions.togglTimeEntriesFetch.request),
      getType(timeEntriesActions.clockifyTimeEntriesTransfer.request),
    )]: (state: TimeEntriesState): TimeEntriesState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(timeEntriesActions.clockifyTimeEntriesFetch.success),
      getType(timeEntriesActions.clockifyTimeEntriesFetch.failure),
      getType(timeEntriesActions.togglTimeEntriesFetch.success),
      getType(timeEntriesActions.togglTimeEntriesFetch.failure),
      getType(timeEntriesActions.clockifyTimeEntriesTransfer.success),
      getType(timeEntriesActions.clockifyTimeEntriesTransfer.failure),
    )]: (state: TimeEntriesState): TimeEntriesState => ({
      ...state,
      isFetching: false,
    }),

    [getType(timeEntriesActions.flipIsTimeEntryIncluded)]: (
      state: TimeEntriesState,
      { payload: timeEntryId }: ReduxAction<string>,
    ): TimeEntriesState => utils.flipEntityInclusion(state, timeEntryId),

    [getType(flipIsProjectIncluded)]: (
      state: TimeEntriesState,
      { payload: projectId }: ReduxAction<string>,
    ): TimeEntriesState =>
      pushInclusionFlipToTimeEntry(state, 'projectId', projectId),

    [getType(flipIsTaskIncluded)]: (
      state: TimeEntriesState,
      { payload: taskId }: ReduxAction<string>,
    ): TimeEntriesState =>
      pushInclusionFlipToTimeEntry(state, 'taskId', taskId),

    [getType(flipIsUserIncluded)]: (
      state: TimeEntriesState,
      { payload: userId }: ReduxAction<string>,
    ): TimeEntriesState =>
      pushInclusionFlipToTimeEntry(state, 'userId', userId),

    [getType(timeEntriesActions.addLinksToTimeEntries)]: (
      state: TimeEntriesState,
      { payload: newTimeEntriesState }: ReduxAction<TimeEntriesState>,
    ): TimeEntriesState => ({
      ...state,
      ...newTimeEntriesState,
    }),
  },
  initialState,
);

function pushInclusionFlipToTimeEntry(
  state: TimeEntriesState,
  parentIdFieldName: string,
  parentId: string,
): TimeEntriesState {
  const timeEntriesById = { ...state.toggl.byId };

  const updatedEntriesById = Object.entries(timeEntriesById).reduce(
    (acc, [timeEntryId, { isIncluded, ...timeEntry }]) => ({
      ...acc,
      [timeEntryId]: {
        ...timeEntry,
        isIncluded:
          get(timeEntry, parentIdFieldName) === parentId
            ? !isIncluded
            : isIncluded,
      },
    }),
    {},
  );

  return {
    ...state,
    toggl: {
      ...state.toggl,
      byId: updatedEntriesById,
    },
  };
}
