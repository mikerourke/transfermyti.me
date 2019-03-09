import { combineActions, handleActions } from 'redux-actions';
import {
  getEntityIdFieldValue,
  getEntityNormalizedState,
  updateIsEntityIncluded,
} from '~/redux/utils';
import {
  clockifyUserGroupsFetchFailure,
  clockifyUserGroupsFetchStarted,
  clockifyUserGroupsFetchSuccess,
  togglUserGroupsFetchFailure,
  togglUserGroupsFetchStarted,
  togglUserGroupsFetchSuccess,
  clockifyUserGroupsTransferFailure,
  clockifyUserGroupsTransferStarted,
  clockifyUserGroupsTransferSuccess,
  updateIsUserGroupIncluded,
} from './userGroupsActions';
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
      clockifyUserGroupsFetchSuccess,
      clockifyUserGroupsTransferSuccess,
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

    [togglUserGroupsFetchSuccess]: (
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
      clockifyUserGroupsFetchStarted,
      togglUserGroupsFetchStarted,
      clockifyUserGroupsTransferStarted,
    )]: (state: UserGroupsState): UserGroupsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyUserGroupsFetchSuccess,
      clockifyUserGroupsFetchFailure,
      togglUserGroupsFetchSuccess,
      togglUserGroupsFetchFailure,
      clockifyUserGroupsTransferSuccess,
      clockifyUserGroupsTransferFailure,
    )]: (state: UserGroupsState): UserGroupsState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsUserGroupIncluded]: (
      state: UserGroupsState,
      { payload: userGroupId }: ReduxAction<string>,
    ): UserGroupsState =>
      updateIsEntityIncluded(state, EntityType.UserGroup, userGroupId),
  },
  initialState,
);
