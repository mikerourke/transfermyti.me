import { createReducer, ActionType } from "typesafe-actions";
import { mod, toggle } from "shades";
import * as userGroupsActions from "./userGroupsActions";
import { UserGroupModel } from "./userGroupsTypes";

type UserGroupsAction = ActionType<typeof userGroupsActions>;

export interface UserGroupsState {
  readonly source: Record<string, UserGroupModel>;
  readonly target: Record<string, UserGroupModel>;
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
      userGroupsActions.fetchClockifyUserGroups.success,
      userGroupsActions.fetchTogglUserGroups.success,
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
      userGroupsActions.createClockifyUserGroups.request,
      userGroupsActions.createTogglUserGroups.request,
      userGroupsActions.fetchClockifyUserGroups.request,
      userGroupsActions.fetchTogglUserGroups.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      userGroupsActions.createClockifyUserGroups.success,
      userGroupsActions.createTogglUserGroups.success,
      userGroupsActions.createClockifyUserGroups.failure,
      userGroupsActions.createTogglUserGroups.failure,
      userGroupsActions.fetchClockifyUserGroups.failure,
      userGroupsActions.fetchTogglUserGroups.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    userGroupsActions.flipIsUserGroupIncluded,
    (state, { payload }) => mod("source", payload, "isIncluded")(toggle)(state),
  );
