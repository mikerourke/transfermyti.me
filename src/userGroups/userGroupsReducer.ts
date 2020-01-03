import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";
import * as userGroupsActions from "./userGroupsActions";
import { UserGroupsByIdModel } from "./userGroupsTypes";

type UserGroupsAction = ActionType<typeof userGroupsActions>;

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
      ...payload,
      isFetching: false,
    }),
  )
  .handleAction(
    [
      userGroupsActions.createUserGroups.request,
      userGroupsActions.fetchUserGroups.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      userGroupsActions.createUserGroups.failure,
      userGroupsActions.fetchUserGroups.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    userGroupsActions.flipIsUserGroupIncluded,
    (state, { payload }) =>
      R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
