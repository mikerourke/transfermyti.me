import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";
import { updateAreAllRecordsIncluded } from "~/redux/reduxUtils";
import { flushAllEntities } from "~/allEntities/allEntitiesActions";
import * as timeEntriesActions from "./timeEntriesActions";
import { TimeEntriesByIdModel } from "./timeEntriesTypes";

type TimeEntriesAction = ActionType<
  typeof timeEntriesActions | typeof flushAllEntities
>;

export interface TimeEntriesState {
  readonly source: TimeEntriesByIdModel;
  readonly target: TimeEntriesByIdModel;
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
      timeEntriesActions.fetchTimeEntries.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      timeEntriesActions.createTimeEntries.failure,
      timeEntriesActions.fetchTimeEntries.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    timeEntriesActions.addLinksToTimeEntries,
    (state, { payload }) => ({
      ...state,
      ...payload,
    }),
  )
  .handleAction(
    timeEntriesActions.flipIsTimeEntryIncluded,
    (state, { payload }) =>
      R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  )
  .handleAction(
    timeEntriesActions.updateAreAllTimeEntriesIncluded,
    (state, { payload }) => ({
      ...state,
      source: updateAreAllRecordsIncluded(state.source, payload),
    }),
  )
  .handleAction(flushAllEntities, () => ({ ...initialState }));
