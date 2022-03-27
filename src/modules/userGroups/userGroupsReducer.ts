import { lensPath, not, over } from "ramda";
import { createReducer, type ActionType } from "typesafe-actions";

import { allEntitiesFlushed } from "~/modules/allEntities/allEntitiesActions";
import * as userGroupsActions from "~/modules/userGroups/userGroupsActions";
import { Mapping, type UserGroup } from "~/typeDefs";

type UserGroupsAction = ActionType<
  typeof userGroupsActions | typeof allEntitiesFlushed
>;

export interface UserGroupsState {
  readonly source: Dictionary<UserGroup>;
  readonly target: Dictionary<UserGroup>;
  readonly isFetching: boolean;
}

export const initialState: UserGroupsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const userGroupsReducer = createReducer<
  UserGroupsState,
  UserGroupsAction
>(initialState)
  .handleAction(
    [
      userGroupsActions.createUserGroups.success,
      userGroupsActions.fetchUserGroups.success,
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
      userGroupsActions.createUserGroups.request,
      userGroupsActions.deleteUserGroups.request,
      userGroupsActions.fetchUserGroups.request,
    ],
    (state) => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      userGroupsActions.createUserGroups.failure,
      userGroupsActions.deleteUserGroups.failure,
      userGroupsActions.fetchUserGroups.failure,
    ],
    (state) => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    userGroupsActions.isUserGroupIncludedToggled,
    (state, { payload }) =>
      over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
  )
  .handleAction(
    [userGroupsActions.deleteUserGroups.success, allEntitiesFlushed],
    () => ({ ...initialState }),
  );
