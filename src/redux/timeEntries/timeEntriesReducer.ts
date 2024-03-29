import { isNil, lensPath, not, over } from "ramda";

import { allEntitiesFlushed } from "~/redux/allEntities/allEntitiesActions";
import {
  createReducer,
  isActionOf,
  type Action,
  type ActionType,
} from "~/redux/reduxTools";
import { Mapping, type TimeEntry } from "~/types";

import * as timeEntriesActions from "./timeEntriesActions";

export type TimeEntriesState = Readonly<{
  source: Dictionary<TimeEntry>;
  target: Dictionary<TimeEntry>;
  isFetching: boolean;
  isDuplicateCheckEnabled: boolean;
}>;

export const timeEntriesInitialState: TimeEntriesState = {
  source: {},
  target: {},
  isFetching: false,
  isDuplicateCheckEnabled: true,
};

export const timeEntriesReducer = createReducer<TimeEntriesState>(
  timeEntriesInitialState,
  (builder) => {
    builder
      .addCase(
        timeEntriesActions.areAllTimeEntriesIncludedUpdated,
        (state, { payload }) => {
          const source: Dictionary<TimeEntry> = {};

          for (const [id, timeEntry] of Object.entries(state.source)) {
            source[id] = { ...timeEntry, isIncluded: payload };
          }

          return { ...state, source };
        },
      )
      .addCase(timeEntriesActions.isDuplicateCheckEnabledToggled, (state) => {
        const isDuplicateCheckEnabled = !state.isDuplicateCheckEnabled;

        const source: Dictionary<TimeEntry> = {};

        for (const [id, timeEntry] of Object.entries(state.source)) {
          const isIncluded = isDuplicateCheckEnabled
            ? false
            : isNil(timeEntry.linkedId);

          source[id] = { ...timeEntry, isIncluded };
        }

        return { ...state, source, isDuplicateCheckEnabled };
      })
      .addCase(
        timeEntriesActions.isTimeEntryIncludedToggled,
        (state, { payload }) =>
          over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
      )
      .addMatcher(isTimeEntriesApiSuccessAction, (state, { payload }) => ({
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
      }))
      .addMatcher(isTimeEntriesApiRequestAction, (state) => {
        state.isFetching = true;
      })
      .addMatcher(isTimeEntriesApiFailureAction, (state) => {
        state.isFetching = false;
      })
      .addMatcher(isResetTimeEntriesStateAction, () => ({
        ...timeEntriesInitialState,
      }));
  },
);

type TimeEntriesCreateOrFetchSuccessAction = ActionType<
  | typeof timeEntriesActions.createTimeEntries.success
  | typeof timeEntriesActions.fetchTimeEntries.success
>;

function isTimeEntriesApiSuccessAction(
  action: Action,
): action is TimeEntriesCreateOrFetchSuccessAction {
  return isActionOf(
    [
      timeEntriesActions.createTimeEntries.success,
      timeEntriesActions.fetchTimeEntries.success,
    ],
    action,
  );
}

type TimeEntriesApiRequestAction = ActionType<
  | typeof timeEntriesActions.createTimeEntries.request
  | typeof timeEntriesActions.deleteTimeEntries.request
  | typeof timeEntriesActions.fetchTimeEntries.request
>;

function isTimeEntriesApiRequestAction(
  action: Action,
): action is TimeEntriesApiRequestAction {
  return isActionOf(
    [
      timeEntriesActions.createTimeEntries.request,
      timeEntriesActions.deleteTimeEntries.request,
      timeEntriesActions.fetchTimeEntries.request,
    ],
    action,
  );
}

type TimeEntriesApiFailureAction = ActionType<
  | typeof timeEntriesActions.createTimeEntries.failure
  | typeof timeEntriesActions.deleteTimeEntries.failure
  | typeof timeEntriesActions.fetchTimeEntries.failure
>;

function isTimeEntriesApiFailureAction(
  action: Action,
): action is TimeEntriesApiFailureAction {
  return isActionOf(
    [
      timeEntriesActions.createTimeEntries.failure,
      timeEntriesActions.deleteTimeEntries.failure,
      timeEntriesActions.fetchTimeEntries.failure,
    ],
    action,
  );
}

type ResetTimeEntriesStateAction = ActionType<
  | typeof timeEntriesActions.deleteTimeEntries.success
  | typeof allEntitiesFlushed
>;

function isResetTimeEntriesStateAction(
  action: Action,
): action is ResetTimeEntriesStateAction {
  return isActionOf(
    [timeEntriesActions.deleteTimeEntries.success, allEntitiesFlushed],
    action,
  );
}
