import { combineActions, handleActions } from 'redux-actions';
import {
  getEntityIdFieldValue,
  getEntityNormalizedState,
  updateIsEntityIncluded,
} from '../../utils';
import {
  clockifyUserGroupsFetchFailure,
  clockifyUserGroupsFetchStarted,
  clockifyUserGroupsFetchSuccess,
  togglUserGroupsFetchFailure,
  togglUserGroupsFetchStarted,
  togglUserGroupsFetchSuccess,
  updateIsUserGroupIncluded,
} from './userGroupsActions';
import { EntityType, ToolName } from '../../../types/commonTypes';
import {
  ClockifyUserGroup,
  TogglUserGroup,
  UserGroupModel,
} from '../../../types/userGroupsTypes';
import { ReduxAction } from '../../rootReducer';

interface UserGroupsEntryForTool {
  readonly userGroupsById: Record<string, UserGroupModel>;
  readonly userGroupIds: string[];
}

export interface UserGroupsState {
  readonly clockify: UserGroupsEntryForTool;
  readonly toggl: UserGroupsEntryForTool;
  readonly isFetching: boolean;
}

export const initialState: UserGroupsState = {
  clockify: {
    userGroupsById: {},
    userGroupIds: [],
  },
  toggl: {
    userGroupsById: {},
    userGroupIds: [],
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
    [clockifyUserGroupsFetchSuccess]: (
      state: UserGroupsState,
      { payload: userGroups }: ReduxAction<ClockifyUserGroup[]>,
    ): UserGroupsState =>
      getEntityNormalizedState<UserGroupsState, ClockifyUserGroup[]>(
        ToolName.Clockify,
        EntityType.UserGroup,
        schemaProcessStrategy,
        state,
        userGroups,
      ),

    [togglUserGroupsFetchSuccess]: (
      state: UserGroupsState,
      { payload: userGroups }: ReduxAction<TogglUserGroup[]>,
    ): UserGroupsState =>
      getEntityNormalizedState<UserGroupsState, TogglUserGroup[]>(
        ToolName.Toggl,
        EntityType.UserGroup,
        schemaProcessStrategy,
        state,
        userGroups,
      ),

    [combineActions(
      clockifyUserGroupsFetchStarted,
      togglUserGroupsFetchStarted,
    )]: (state: UserGroupsState): UserGroupsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyUserGroupsFetchSuccess,
      clockifyUserGroupsFetchFailure,
      togglUserGroupsFetchSuccess,
      togglUserGroupsFetchFailure,
    )]: (state: UserGroupsState): UserGroupsState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsUserGroupIncluded]: (
      state: UserGroupsState,
      { payload: userGroupId }: ReduxAction<string>,
    ): UserGroupsState =>
      updateIsEntityIncluded<UserGroupsState>(
        state,
        EntityType.UserGroup,
        userGroupId,
      ),
  },
  initialState,
);
