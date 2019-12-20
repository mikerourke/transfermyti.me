import { createReducer, ActionType } from "typesafe-actions";
import { get, uniq } from "lodash";
import * as utils from "~/redux/utils";
import * as userGroupsActions from "./userGroupsActions";
import { UserGroupTransform } from "./UserGroupTransform";
import {
  CompoundUserGroupModel,
  EntityGroup,
  ReduxStateEntryForTool,
  ToolName,
} from "~/types";

type UserGroupsAction = ActionType<typeof userGroupsActions>;

export interface UserGroupsState {
  readonly clockify: ReduxStateEntryForTool<CompoundUserGroupModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundUserGroupModel>;
  readonly isFetching: boolean;
}

export const initialState: UserGroupsState = {
  clockify: {
    byId: {},
    idValues: [],
  },
  toggl: {
    byId: {},
    idValues: [],
  },
  isFetching: false,
};

export const userGroupsReducer = createReducer<
  UserGroupsState,
  UserGroupsAction
>(initialState)
  .handleAction(
    [
      userGroupsActions.clockifyUserGroupsFetch.success,
      userGroupsActions.clockifyUserGroupsTransfer.success,
    ],
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.UserGroups,
        entityState: state,
        payload: payload.entityRecords,
      });

      const linkedState = utils.linkEntitiesInStateByName(
        EntityGroup.UserGroups,
        normalizedState,
      );
      return { ...linkedState, isFetching: false };
    },
  )
  .handleAction(
    userGroupsActions.togglUserGroupsFetch.success,
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.UserGroups,
        entityState: state,
        payload: payload.entityRecords,
      });
      return { ...normalizedState, isFetching: false };
    },
  )
  .handleAction(
    [
      userGroupsActions.clockifyUserGroupsFetch.request,
      userGroupsActions.clockifyUserGroupsTransfer.request,
      userGroupsActions.togglUserGroupsFetch.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      userGroupsActions.clockifyUserGroupsFetch.failure,
      userGroupsActions.clockifyUserGroupsTransfer.failure,
      userGroupsActions.togglUserGroupsFetch.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    userGroupsActions.flipIsUserGroupIncluded,
    (state, { payload }) => utils.flipEntityInclusion(state, payload),
  )
  .handleAction(
    userGroupsActions.addTogglUserIdToGroup,
    (state, { payload }) => {
      const userGroup = get(state, ["toggl", "byId", payload.userGroupId]);
      if (!userGroup) {
        return state;
      }

      const newUserIds = uniq([...userGroup.userIds, payload.userId]);
      return {
        ...state,
        toggl: {
          ...state.toggl,
          byId: {
            ...state.toggl.byId,
            [payload.userGroupId]: {
              ...userGroup,
              userIds: newUserIds,
            },
          },
        },
      };
    },
  )
  .handleAction(
    userGroupsActions.calculateUserGroupEntryCounts,
    (state, { payload }) => {
      const { toolName, timeEntries, usersById } = payload;
      const userGroupsById = state[toolName].byId;

      const updatedUserGroupsById = Object.entries(userGroupsById).reduce(
        (userGroupsAcc, [userGroupId, userGroup]) => {
          const transform = new UserGroupTransform(userGroup);
          return {
            ...userGroupsAcc,
            [userGroupId]: transform.appendEntryCount(usersById, timeEntries),
          };
        },
        {},
      );

      return {
        ...state,
        [toolName]: {
          ...state[toolName],
          byId: updatedUserGroupsById,
        },
      };
    },
  );
