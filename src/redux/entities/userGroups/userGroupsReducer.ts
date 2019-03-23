import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { get, uniq } from 'lodash';
import {
  findIdFieldValue,
  normalizeState,
  swapEntityInclusion,
} from '~/redux/utils';
import * as userGroupsActions from './userGroupsActions';
import {
  EntityGroup,
  EntityType,
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import {
  ClockifyUserGroup,
  TogglUserGroup,
  UserGroupModel,
} from '~/types/userGroupsTypes';

export interface UserGroupsState {
  readonly clockify: ReduxStateEntryForTool<UserGroupModel>;
  readonly toggl: ReduxStateEntryForTool<UserGroupModel>;
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

const schemaProcessStrategy = (
  value: ClockifyUserGroup | TogglUserGroup,
): UserGroupModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId: getEntityIdFieldValue(value, EntityType.Workspace),
  userIds: 'userIds' in value ? value.userIds : [],
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [combineActions(
      getType(userGroupsActions.clockifyUserGroupsFetch.success),
      getType(userGroupsActions.clockifyUserGroupsTransfer.success),
    )]: (
      state: UserGroupsState,
      { payload: userGroups }: ReduxAction<ClockifyUserGroup[]>,
    ): UserGroupsState =>
      getEntityNormalizedState(
        ToolName.Clockify,
        EntityGroup.UserGroups,
        schemaProcessStrategy,
        state,
        userGroups,
      ),

    [getType(userGroupsActions.togglUserGroupsFetch.success)]: (
      state: UserGroupsState,
      { payload: userGroups }: ReduxAction<TogglUserGroup[]>,
    ): UserGroupsState =>
      getEntityNormalizedState(
        ToolName.Toggl,
        EntityGroup.UserGroups,
        schemaProcessStrategy,
        state,
        userGroups,
      ),

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

    [getType(userGroupsActions.updateIsUserGroupIncluded)]: (
      state: UserGroupsState,
      { payload: userGroupId }: ReduxAction<string>,
    ): UserGroupsState =>
      updateIsEntityIncluded(state, EntityType.UserGroup, userGroupId),

    [getType(userGroupsActions.addTogglUserIdToGroup)]: (
      state: UserGroupsState,
      {
        payload: { userId, userGroupId },
      }: ReduxAction<{ userId: string; userGroupId: string }>,
    ): UserGroupsState => {
      const userGroup = get(state, ['toggl', 'byId', userGroupId]);
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
  },
  initialState,
);
