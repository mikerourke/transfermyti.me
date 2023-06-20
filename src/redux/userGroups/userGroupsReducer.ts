import { lensPath, not, over } from "ramda";

import { allEntitiesFlushed } from "~/redux/allEntities/allEntitiesActions";
import {
  createReducer,
  isActionOf,
  type ActionType,
  type AnyAction,
} from "~/redux/reduxTools";
import { Mapping, type UserGroup } from "~/types";

import * as userGroupsActions from "./userGroupsActions";

export interface UserGroupsState {
  readonly source: Dictionary<UserGroup>;
  readonly target: Dictionary<UserGroup>;
  readonly isFetching: boolean;
}

export const userGroupsInitialState: UserGroupsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const userGroupsReducer = createReducer<UserGroupsState>(
  userGroupsInitialState,
  (builder) => {
    builder
      .addCase(
        userGroupsActions.isUserGroupIncludedToggled,
        (state, { payload }) =>
          over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
      )
      .addMatcher(isUserGroupsApiSuccessAction, (state, { payload }) => ({
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
      .addMatcher(isUserGroupsApiRequestAction, (state) => {
        state.isFetching = true;
      })
      .addMatcher(isUserGroupsApiFailureAction, (state) => {
        state.isFetching = false;
      })
      .addMatcher(isResetUserGroupsStateAction, () => ({
        ...userGroupsInitialState,
      }));
  },
);

type UserGroupsCreateOrFetchSuccessAction = ActionType<
  | typeof userGroupsActions.createUserGroups.success
  | typeof userGroupsActions.fetchUserGroups.success
>;

function isUserGroupsApiSuccessAction(
  action: AnyAction,
): action is UserGroupsCreateOrFetchSuccessAction {
  return isActionOf(
    [
      userGroupsActions.createUserGroups.success,
      userGroupsActions.fetchUserGroups.success,
    ],
    action,
  );
}

type UserGroupsApiRequestAction = ActionType<
  | typeof userGroupsActions.createUserGroups.request
  | typeof userGroupsActions.deleteUserGroups.request
  | typeof userGroupsActions.fetchUserGroups.request
>;

function isUserGroupsApiRequestAction(
  action: AnyAction,
): action is UserGroupsApiRequestAction {
  return isActionOf(
    [
      userGroupsActions.createUserGroups.request,
      userGroupsActions.deleteUserGroups.request,
      userGroupsActions.fetchUserGroups.request,
    ],
    action,
  );
}

type UserGroupsApiFailureAction = ActionType<
  | typeof userGroupsActions.createUserGroups.failure
  | typeof userGroupsActions.deleteUserGroups.failure
  | typeof userGroupsActions.fetchUserGroups.failure
>;

function isUserGroupsApiFailureAction(
  action: AnyAction,
): action is UserGroupsApiFailureAction {
  return isActionOf(
    [
      userGroupsActions.createUserGroups.failure,
      userGroupsActions.deleteUserGroups.failure,
      userGroupsActions.fetchUserGroups.failure,
    ],
    action,
  );
}

type ResetUserGroupsStateAction = ActionType<
  typeof userGroupsActions.deleteUserGroups.success | typeof allEntitiesFlushed
>;

function isResetUserGroupsStateAction(
  action: AnyAction,
): action is ResetUserGroupsStateAction {
  return isActionOf(
    [userGroupsActions.deleteUserGroups.success, allEntitiesFlushed],
    action,
  );
}
