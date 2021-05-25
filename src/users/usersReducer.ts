import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";

import * as usersActions from "./usersActions";
import { flushAllEntities } from "~/allEntities/allEntitiesActions";
import { Mapping, UsersByIdModel } from "~/typeDefs";

type UsersAction = ActionType<typeof usersActions | typeof flushAllEntities>;

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
  .handleAction(
    [
      usersActions.createUsers.request,
      usersActions.deleteUsers.request,
      usersActions.fetchUsers.request,
    ],
    (state) => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      usersActions.createUsers.success,
      usersActions.createUsers.failure,
      usersActions.deleteUsers.failure,
      usersActions.fetchUsers.failure,
    ],
    (state) => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(usersActions.flipIsUserIncluded, (state, { payload }) =>
    R.over(R.lensPath([Mapping.Source, payload, "isIncluded"]), R.not, state),
  )
  .handleAction([usersActions.deleteUsers.success, flushAllEntities], () => ({
    ...initialState,
  }));
