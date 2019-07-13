import { getType } from "typesafe-actions";
import { combineActions, handleActions } from "redux-actions";
import { get, uniq } from "lodash";
import * as utils from "~/redux/utils";
import * as userGroupsActions from "./userGroupsActions";
import { UserGroupTransform } from "./UserGroupTransform";
import {
  ClockifyUserGroupModel,
  CompoundUserGroupModel,
  EntitiesFetchPayloadModel,
  EntityGroup,
  ReduxAction,
  ReduxStateEntryForTool,
  TogglUserGroupModel,
  ToolName,
} from "~/types";

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

export const userGroupsReducer = handleActions(
  {
    [combineActions(
      getType(userGroupsActions.clockifyUserGroupsFetch.success),
      getType(userGroupsActions.clockifyUserGroupsTransfer.success),
    )]: (
      state: UserGroupsState,
      {
        payload: { entityRecords },
      }: ReduxAction<EntitiesFetchPayloadModel<ClockifyUserGroupModel>>,
    ): UserGroupsState => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.UserGroups,
        entityState: state,
        payload: entityRecords,
      });

      return utils.linkEntitiesInStateByName(
        EntityGroup.UserGroups,
        normalizedState,
      );
    },

    [getType(userGroupsActions.togglUserGroupsFetch.success)]: (
      state: UserGroupsState,
      {
        payload: { entityRecords },
      }: ReduxAction<EntitiesFetchPayloadModel<TogglUserGroupModel>>,
    ): UserGroupsState =>
      utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.UserGroups,
        entityState: state,
        payload: entityRecords,
      }),

    [combineActions(
      getType(userGroupsActions.clockifyUserGroupsFetch.request),
      getType(userGroupsActions.togglUserGroupsFetch.request),
      getType(userGroupsActions.clockifyUserGroupsTransfer.request),
    )]: (state: UserGroupsState): UserGroupsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(userGroupsActions.clockifyUserGroupsFetch.success),
      getType(userGroupsActions.clockifyUserGroupsFetch.failure),
      getType(userGroupsActions.togglUserGroupsFetch.success),
      getType(userGroupsActions.togglUserGroupsFetch.failure),
      getType(userGroupsActions.clockifyUserGroupsTransfer.success),
      getType(userGroupsActions.clockifyUserGroupsTransfer.failure),
    )]: (state: UserGroupsState): UserGroupsState => ({
      ...state,
      isFetching: false,
    }),

    [getType(userGroupsActions.flipIsUserGroupIncluded)]: (
      state: UserGroupsState,
      { payload: userGroupId }: ReduxAction<string>,
    ): UserGroupsState => utils.flipEntityInclusion(state, userGroupId),

    [getType(userGroupsActions.addTogglUserIdToGroup)]: (
      state: UserGroupsState,
      {
        payload: { userId, userGroupId },
      }: ReduxAction<{ userId: string; userGroupId: string }>,
    ): UserGroupsState => {
      const userGroup = get(state, ["toggl", "byId", userGroupId]);
      if (!userGroup) return state;

      const newUserIds = uniq([...userGroup.userIds, userId]);
      return {
        ...state,
        toggl: {
          ...state.toggl,
          byId: {
            ...state.toggl.byId,
            [userGroupId]: {
              ...userGroup,
              userIds: newUserIds,
            },
          },
        },
      };
    },

    [getType(userGroupsActions.calculateUserGroupEntryCounts)]: (
      state: UserGroupsState,
      {
        payload: { toolName, timeEntries, usersById },
      }: ReduxAction<userGroupsActions.EntryCountCalculatorModel>,
    ) => {
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
  },
  initialState,
);
