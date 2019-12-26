import { createReducer, ActionType } from "typesafe-actions";
import * as R from "ramda";
import * as usersActions from "./usersActions";
import { UsersByIdModel } from "./usersTypes";

type UsersAction = ActionType<typeof usersActions>;

export interface UsersState {
  readonly source: UsersByIdModel;
  readonly target: UsersByIdModel;
  readonly isFetching: boolean;
}

export const initialState: UsersState = {
  source: {},
  target: {},
  isFetching: false,
};

export const usersReducer = createReducer<UsersState, UsersAction>(initialState)
  .handleAction([usersActions.fetchUsers.success], (state, { payload }) => ({
    ...state,
    ...payload,
    isFetching: false,
  }))
  .handleAction(
    [usersActions.createUsers.request, usersActions.fetchUsers.request],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      usersActions.createUsers.success,
      usersActions.createUsers.failure,
      usersActions.fetchUsers.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(usersActions.flipIsUserIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
