import { createReducer, ActionType } from "typesafe-actions";
import { mod, toggle } from "shades";
import * as timeEntriesActions from "./timeEntriesActions";
import { TimeEntryModel } from "./timeEntriesTypes";

type TimeEntriesAction = ActionType<typeof timeEntriesActions>;

export interface TimeEntriesState {
  readonly source: Record<string, TimeEntryModel>;
  readonly target: Record<string, TimeEntryModel>;
  readonly isFetching: boolean;
}

export const initialState: TimeEntriesState = {
  source: {},
  target: {},
  isFetching: false,
};

export const timeEntriesReducer = createReducer<
  TimeEntriesState,
  TimeEntriesAction
>(initialState)
  .handleAction(
    [
      timeEntriesActions.fetchClockifyTimeEntries.success,
      timeEntriesActions.fetchTogglTimeEntries.success,
    ],
    (state, { payload }) => ({
      ...state,
      [payload.mapping]: {
        ...state[payload.mapping],
        ...payload.recordsById,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      timeEntriesActions.createClockifyTimeEntries.request,
      timeEntriesActions.createTogglTimeEntries.request,
      timeEntriesActions.fetchClockifyTimeEntries.request,
      timeEntriesActions.fetchTogglTimeEntries.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      timeEntriesActions.createClockifyTimeEntries.failure,
      timeEntriesActions.createTogglTimeEntries.failure,
      timeEntriesActions.fetchClockifyTimeEntries.failure,
      timeEntriesActions.fetchTogglTimeEntries.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    timeEntriesActions.flipIsTimeEntryIncluded,
    (state, { payload }) => mod("source", payload, "isIncluded")(toggle)(state),
  )
  .handleAction(
    timeEntriesActions.addLinksToTimeEntries,
    (state, { payload }) => ({
      ...state,
      ...payload,
    }),
  );
