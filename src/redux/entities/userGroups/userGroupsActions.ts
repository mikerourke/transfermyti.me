import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { get } from 'lodash';
import { batchClockifyRequests, getValidEntities } from '~/redux/utils';
import {
  apiCreateClockifyUserGroup,
  apiFetchClockifyUserGroups,
  apiFetchTogglUserGroups,
} from '~/redux/entities/api/userGroups';
import {
  showFetchErrorNotification,
  updateInTransferEntity,
} from '~/redux/app/appActions';
import {
  selectClockifyUsersByWorkspace,
  selectTogglUsersByWorkspaceFactory,
} from '~/redux/entities/users/usersSelectors';
import { selectUserGroupsTransferPayloadForWorkspace } from './userGroupsSelectors';
import { ReduxDispatch, ReduxGetState, ToolName } from '~/types/commonTypes';
import { EntityType } from '~/types/entityTypes';
import { TimeEntryModel } from '~/types/timeEntriesTypes';
import {
  ClockifyUserGroup,
  TogglUserGroup,
  UserGroupModel,
} from '~/types/userGroupsTypes';
import { UserModel } from '~/types/usersTypes';

export interface EntryCountCalculatorModel {
  toolName: ToolName;
  timeEntries: TimeEntryModel[];
  usersById: Record<string, UserModel>;
}

export const clockifyUserGroupsFetch = createAsyncAction(
  '@userGroups/CLOCKIFY_FETCH_REQUEST',
  '@userGroups/CLOCKIFY_FETCH_SUCCESS',
  '@userGroups/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyUserGroup[], void>();

export const togglUserGroupsFetch = createAsyncAction(
  '@userGroups/TOGGL_FETCH_REQUEST',
  '@userGroups/TOGGL_FETCH_SUCCESS',
  '@userGroups/TOGGL_FETCH_FAILURE',
)<void, UserGroupModel[], void>();

export const clockifyUserGroupsTransfer = createAsyncAction(
  '@userGroups/CLOCKIFY_TRANSFER_REQUEST',
  '@userGroups/CLOCKIFY_TRANSFER_SUCCESS',
  '@userGroups/CLOCKIFY_TRANSFER_FAILURE',
)<void, ClockifyUserGroup[], void>();

export const flipIsUserGroupIncluded = createStandardAction(
  '@userGroups/FLIP_IS_INCLUDED',
)<string>();

export const addTogglUserIdToGroup = createStandardAction(
  '@userGroups/ADD_TOGGL_USER_ID_TO_GROUP',
)<{ userId: string; userGroupId: string }>();

export const calculateUserGroupEntryCounts = createStandardAction(
  '@userGroups/CALCULATE_ENTRY_COUNTS',
)<EntryCountCalculatorModel>();

const convertUserGroupsFromToolToUniversal = (
  workspaceId: string,
  userGroups: (TogglUserGroup | ClockifyUserGroup)[],
  usersByWorkspace: Record<string, UserModel[]>,
): UserGroupModel[] => {
  if (getValidEntities(userGroups).length === 0) return [];

  const workspaceUsers = get(usersByWorkspace, workspaceId, []);

  return userGroups.map(userGroup => {
    const userGroupId = userGroup.id.toString();
    const usersInUserGroup: UserModel[] = [];

    if (workspaceUsers.length !== 0) {
      workspaceUsers.forEach(workspaceUser => {
        if (workspaceUser.userGroupIds.includes(userGroupId)) {
          usersInUserGroup.push(workspaceUser);
        }
      });
    }

    const userIds: string[] = [];

    if (usersInUserGroup.length !== 0) {
      usersInUserGroup.forEach(user => {
        userIds.push(user.id);
      });
    }

    return {
      id: userGroupId,
      name: userGroup.name,
      workspaceId,
      userIds: 'userIds' in userGroup ? userGroup.userIds : userIds,
      entryCount: 0,
      linkedId: null,
      isIncluded: true,
    };
  });
};

export const fetchClockifyUserGroups = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(clockifyUserGroupsFetch.request());

  try {
    const clockifyUserGroups = await apiFetchClockifyUserGroups(workspaceId);

    const state = getState();
    const usersByWorkspace = selectClockifyUsersByWorkspace(state);
    const userGroups = convertUserGroupsFromToolToUniversal(
      workspaceId,
      clockifyUserGroups,
      usersByWorkspace,
    );

    return dispatch(clockifyUserGroupsFetch.success(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUserGroupsFetch.failure());
  }
};

export const fetchTogglUserGroups = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(togglUserGroupsFetch.request());

  try {
    const togglUserGroups = await apiFetchTogglUserGroups(workspaceId);

    const state = getState();
    const usersByWorkspace = selectTogglUsersByWorkspaceFactory(false)(state);
    const userGroups = convertUserGroupsFromToolToUniversal(
      workspaceId,
      togglUserGroups,
      usersByWorkspace,
    );

    return dispatch(togglUserGroupsFetch.success(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglUserGroupsFetch.failure());
  }
};

export const transferUserGroupsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const userGroupsInWorkspace = selectUserGroupsTransferPayloadForWorkspace(
    state,
  )(togglWorkspaceId);
  if (userGroupsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyUserGroupsTransfer.request());

  const onUserGroup = (userGroup: UserGroupModel) => {
    const transferRecord = { ...userGroup, type: EntityType.UserGroup };
    dispatch(updateInTransferEntity(transferRecord));
  };

  try {
    const userGroups = await batchClockifyRequests(
      onUserGroup,
      userGroupsInWorkspace,
      apiCreateClockifyUserGroup,
      clockifyWorkspaceId,
    );
    return dispatch(clockifyUserGroupsTransfer.success(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUserGroupsTransfer.failure());
  }
};
