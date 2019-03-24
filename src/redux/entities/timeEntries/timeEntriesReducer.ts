import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { normalizeState } from '~/redux/utils';
import * as timeEntriesActions from './timeEntriesActions';
import {
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';
import {
  ClockifyTimeEntry,
  TimeEntryModel,
  TogglTimeEntry,
} from '~/types/timeEntriesTypes';

export interface TimeEntriesState {
  readonly clockify: ReduxStateEntryForTool<TimeEntryModel>;
  readonly toggl: ReduxStateEntryForTool<TimeEntryModel>;
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

export default handleActions(
  {
    [getType(timeEntriesActions.clockifyTimeEntriesFetch.success)]: (
      state: TimeEntriesState,
      { payload: timeEntries }: ReduxAction<ClockifyTimeEntry[]>,
    ): TimeEntriesState =>
      normalizeState(
        ToolName.Clockify,
        EntityGroup.TimeEntries,
        state,
        timeEntries,
      ),

    [getType(timeEntriesActions.togglTimeEntriesFetch.success)]: (
      state: TimeEntriesState,
      { payload: timeEntries }: ReduxAction<TogglTimeEntry[]>,
    ): TimeEntriesState =>
      normalizeState(
        ToolName.Toggl,
        EntityGroup.TimeEntries,
        state,
        timeEntries,
      ),

    [combineActions(
      getType(timeEntriesActions.clockifyTimeEntriesFetch.request),
      getType(timeEntriesActions.togglTimeEntriesFetch.request),
    )]: (state: TimeEntriesState): TimeEntriesState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(timeEntriesActions.clockifyTimeEntriesFetch.success),
      getType(timeEntriesActions.clockifyTimeEntriesFetch.failure),
      getType(timeEntriesActions.togglTimeEntriesFetch.success),
      getType(timeEntriesActions.togglTimeEntriesFetch.failure),
    )]: (state: TimeEntriesState): TimeEntriesState => ({
      ...state,
      isFetching: false,
    }),
  },
  initialState,
);
