import { lensPath, not, over } from "ramda";

import { allEntitiesFlushed } from "~/redux/allEntities/allEntitiesActions";
import {
  createReducer,
  isActionOf,
  type Action,
  type ActionType,
} from "~/redux/reduxTools";
import { Mapping, type User } from "~/types";

import * as usersActions from "./usersActions";

export type UsersState = Readonly<{
  source: Dictionary<User>;
  target: Dictionary<User>;
  isFetching: boolean;
}>;

export const usersInitialState: UsersState = {
  source: {},
  target: {},
  isFetching: false,
};

export const usersReducer = createReducer<UsersState>(
  usersInitialState,
  (builder) => {
    builder
      .addCase(usersActions.isUserIncludedToggled, (state, { payload }) =>
        over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
      )
      .addCase(usersActions.fetchUsers.success, (state, { payload }) => ({
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
      .addCase(usersActions.createUsers.success, (state) => {
        state.isFetching = false;
      })
      .addMatcher(isUsersApiRequestAction, (state) => {
        state.isFetching = true;
      })
      .addMatcher(isUsersApiFailureAction, (state) => {
        state.isFetching = false;
      })
      .addMatcher(isResetUsersStateAction, () => ({
        ...usersInitialState,
      }));
  },
);

type UsersApiRequestAction = ActionType<
  | typeof usersActions.createUsers.request
  | typeof usersActions.deleteUsers.request
  | typeof usersActions.fetchUsers.request
>;

function isUsersApiRequestAction(
  action: Action,
): action is UsersApiRequestAction {
  return isActionOf(
    [
      usersActions.createUsers.request,
      usersActions.deleteUsers.request,
      usersActions.fetchUsers.request,
    ],
    action,
  );
}

type UsersApiFailureAction = ActionType<
  | typeof usersActions.createUsers.failure
  | typeof usersActions.deleteUsers.failure
  | typeof usersActions.fetchUsers.failure
>;

function isUsersApiFailureAction(
  action: Action,
): action is UsersApiFailureAction {
  return isActionOf(
    [
      usersActions.createUsers.failure,
      usersActions.deleteUsers.failure,
      usersActions.fetchUsers.failure,
    ],
    action,
  );
}

type ResetUsersStateAction = ActionType<
  typeof usersActions.deleteUsers.success | typeof allEntitiesFlushed
>;

function isResetUsersStateAction(
  action: Action,
): action is ResetUsersStateAction {
  return isActionOf(
    [usersActions.deleteUsers.success, allEntitiesFlushed],
    action,
  );
}
