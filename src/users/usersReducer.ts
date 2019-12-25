import { createReducer, ActionType } from "typesafe-actions";
import * as R from "ramda";
import * as usersActions from "./usersActions";
import { UserModel } from "./usersTypes";

type UsersAction = ActionType<typeof usersActions>;

export interface UsersState {
  readonly source: Record<string, UserModel>;
  readonly target: Record<string, UserModel>;
  readonly isFetching: boolean;
}

export const initialState: UsersState = {
  source: {},
  target: {},
  isFetching: false,
};

export const usersReducer = createReducer<UsersState, UsersAction>(initialState)
  .handleAction(
    [
      usersActions.fetchClockifyUsers.success,
      usersActions.fetchTogglUsers.success,
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
      usersActions.createClockifyUsers.request,
      usersActions.createTogglUsers.request,
      usersActions.fetchClockifyUsers.request,
      usersActions.fetchTogglUsers.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      usersActions.createClockifyUsers.success,
      usersActions.createTogglUsers.success,
      usersActions.createClockifyUsers.failure,
      usersActions.createTogglUsers.failure,
      usersActions.fetchClockifyUsers.failure,
      usersActions.fetchTogglUsers.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(usersActions.flipIsUserIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
