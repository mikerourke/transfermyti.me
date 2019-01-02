import { combineActions, handleActions } from 'redux-actions';
import ReduxEntity from '../../../utils/ReduxEntity';
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
  workspaceId: ReduxEntity.getIdFieldValue(value, EntityType.Workspace),
  userIds: 'userIds' in value ? value.userIds : [],
  entryCount: 0,
  isIncluded: true,
});

const reduxEntity = new ReduxEntity(
  EntityType.UserGroup,
  schemaProcessStrategy,
);

export default handleActions(
  {
    [clockifyUserGroupsFetchSuccess]: (
      state: UserGroupsState,
      { payload }: ReduxAction<ClockifyUserGroup[]>,
    ): UserGroupsState =>
      reduxEntity.getNormalizedState<UserGroupsState, ClockifyUserGroup[]>(
        ToolName.Clockify,
        state,
        payload,
      ),

    [togglUserGroupsFetchSuccess]: (
      state: UserGroupsState,
      { payload }: ReduxAction<TogglUserGroup[]>,
    ): UserGroupsState =>
      reduxEntity.getNormalizedState<UserGroupsState, TogglUserGroup[]>(
        ToolName.Toggl,
        state,
        payload,
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
      reduxEntity.updateIsIncluded<UserGroupsState>(state, userGroupId),
  },
  initialState,
);
