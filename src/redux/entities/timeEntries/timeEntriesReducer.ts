import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import * as utils from '~/redux/utils';
import { flipIsProjectIncluded } from '~/redux/entities/projects/projectsActions';
import * as timeEntriesActions from './timeEntriesActions';
import {
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup, EntityType } from '~/types/entityTypes';
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

export const timeEntriesReducer = handleActions(
  {
    [getType(timeEntriesActions.clockifyTimeEntriesFetch.success)]: (
      state: TimeEntriesState,
      { payload: timeEntries }: ReduxAction<Array<ClockifyTimeEntry>>,
    ): TimeEntriesState =>
      utils.normalizeState(
        ToolName.Clockify,
        EntityGroup.TimeEntries,
        state,
        timeEntries,
      ),

    [getType(timeEntriesActions.togglTimeEntriesFetch.success)]: (
      state: TimeEntriesState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntry>>,
    ): TimeEntriesState =>
      utils.normalizeState(
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

    [getType(timeEntriesActions.flipIsTimeEntryIncluded)]: (
      state: TimeEntriesState,
      { payload: timeEntryId }: ReduxAction<string>,
    ): TimeEntriesState =>
      utils.flipEntityInclusion(state, EntityType.Task, timeEntryId),

    [getType(flipIsProjectIncluded)]: (
      state: TimeEntriesState,
      { payload: projectId }: ReduxAction<string>,
    ): TimeEntriesState => {
      const timeEntriesById = { ...state.toggl.byId };
      const updatedEntriesById = Object.entries(timeEntriesById).reduce(
        (acc, [timeEntryId, { isIncluded, ...timeEntry }]) => ({
          ...acc,
          [timeEntryId]: {
            ...timeEntry,
            isIncluded:
              timeEntry.projectId === projectId ? !isIncluded : isIncluded,
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
    },

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
