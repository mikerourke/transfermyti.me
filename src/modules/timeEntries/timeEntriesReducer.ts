import * as R from "ramda";
import { type ActionType, createReducer } from "typesafe-actions";

import { allEntitiesFlushed } from "~/modules/allEntities/allEntitiesActions";
import * as timeEntriesActions from "~/modules/timeEntries/timeEntriesActions";
import { Mapping, type TimeEntry } from "~/typeDefs";

type TimeEntriesAction = ActionType<
  typeof timeEntriesActions | typeof allEntitiesFlushed
>;

export interface TimeEntriesState {
  readonly source: Dictionary<TimeEntry>;
  readonly target: Dictionary<TimeEntry>;
  readonly isFetching: boolean;
  readonly isDuplicateCheckEnabled: boolean;
}

export const initialState: TimeEntriesState = {
  source: {},
  target: {},
  isFetching: false,
  isDuplicateCheckEnabled: true,
};

export const timeEntriesReducer = createReducer<
  TimeEntriesState,
  TimeEntriesAction
>(initialState)
  .handleAction(
    [
      timeEntriesActions.createTimeEntries.success,
      timeEntriesActions.fetchTimeEntries.success,
    ],
    (state, { payload }) => ({
      ...state,
      source: {
        ...state.source,
        ...payload.source,
      },
      target: {
        ...state.target,
        ...payload.target,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      timeEntriesActions.createTimeEntries.request,
      timeEntriesActions.deleteTimeEntries.request,
      timeEntriesActions.fetchTimeEntries.request,
    ],
    (state) => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      timeEntriesActions.createTimeEntries.failure,
      timeEntriesActions.deleteTimeEntries.failure,
      timeEntriesActions.fetchTimeEntries.failure,
    ],
    (state) => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    timeEntriesActions.flipIsTimeEntryIncluded,
    (state, { payload }) =>
      R.over(R.lensPath([Mapping.Source, payload, "isIncluded"]), R.not, state),
  )
  .handleAction(timeEntriesActions.flipIsDuplicateCheckEnabled, (state) => {
    const newIsDuplicateCheckEnabled = !state.isDuplicateCheckEnabled;
    const newSource = Object.entries({ ...state.source }).reduce(
      (acc, [id, timeEntry]) => ({
        ...acc,
        [id]: {
          ...timeEntry,
          isIncluded: newIsDuplicateCheckEnabled
            ? false
            : R.isNil(timeEntry.linkedId),
        },
      }),
      {},
    );

    return {
      ...state,
      source: newSource,
      isDuplicateCheckEnabled: !state.isDuplicateCheckEnabled,
    };
  })
  .handleAction(
    timeEntriesActions.updateAreAllTimeEntriesIncluded,
    (state, { payload }) => ({
      ...state,
      source: Object.entries(state.source).reduce(
        (acc, [id, record]) => ({
          ...acc,
          [id]: {
            ...record,
            isIncluded: payload,
          },
        }),
        {},
      ),
    }),
  )
  .handleAction(
    [timeEntriesActions.deleteTimeEntries.success, allEntitiesFlushed],
    () => ({ ...initialState }),
  );
