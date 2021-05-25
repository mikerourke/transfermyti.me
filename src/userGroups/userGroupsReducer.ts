import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";

import * as userGroupsActions from "./userGroupsActions";
import { flushAllEntities } from "~/allEntities/allEntitiesActions";
import { Mapping, UserGroupsByIdModel } from "~/typeDefs";

type UserGroupsAction = ActionType<
  typeof userGroupsActions | typeof flushAllEntities
>;

export interface UserGroupsState {
  readonly source: UserGroupsByIdModel;
  readonly target: UserGroupsByIdModel;
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
    userGroupsActions.flipIsUserGroupIncluded,
    (state, { payload }) =>
      R.over(R.lensPath([Mapping.Source, payload, "isIncluded"]), R.not, state),
  )
  .handleAction(
    [userGroupsActions.deleteUserGroups.success, flushAllEntities],
    () => ({ ...initialState }),
  );
