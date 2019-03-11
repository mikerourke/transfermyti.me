import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { batchClockifyRequests } from '~/redux/utils';
import {
  apiCreateClockifyUserGroup,
  apiFetchClockifyUserGroups,
  apiFetchTogglUserGroups,
} from '~/redux/entities/api/userGroups';
import {
  showFetchErrorNotification,
  updateInTransferEntity,
} from '~/redux/app/appActions';
import { selectUserGroupsTransferPayloadForWorkspace } from './userGroupsSelectors';
import { EntityType, ReduxDispatch, ReduxGetState } from '~/types/commonTypes';
import { ClockifyUserGroup, TogglUserGroup } from '~/types/userGroupsTypes';

export const clockifyUserGroupsFetch = createAsyncAction(
  '@userGroups/CLOCKIFY_FETCH_REQUEST',
  '@userGroups/CLOCKIFY_FETCH_SUCCESS',
  '@userGroups/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyUserGroup[], void>();

export const togglUserGroupsFetch = createAsyncAction(
  '@userGroups/TOGGL_FETCH_REQUEST',
  '@userGroups/TOGGL_FETCH_SUCCESS',
  '@userGroups/TOGGL_FETCH_FAILURE',
)<void, TogglUserGroup[], void>();

export const clockifyUserGroupsTransfer = createAsyncAction(
  '@userGroups/CLOCKIFY_TRANSFER_REQUEST',
  '@userGroups/CLOCKIFY_TRANSFER_SUCCESS',
  '@userGroups/CLOCKIFY_TRANSFER_FAILURE',
)<void, ClockifyUserGroup[], void>();

export const updateIsUserGroupIncluded = createStandardAction(
  '@userGroups/UPDATE_IS_INCLUDED',
)<string>();

export const addTogglUserIdToGroup = createStandardAction(
  '@userGroups/ADD_TOGGL_USER_ID_TO_GROUP',
)<{ userId: string; userGroupId: string }>();

export const fetchClockifyUserGroups = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyUserGroupsFetch.request());
  try {
    const userGroups = await apiFetchClockifyUserGroups(workspaceId);
    return dispatch(clockifyUserGroupsFetch.success(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUserGroupsFetch.failure());
  }
};

export const fetchTogglUserGroups = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglUserGroupsFetch.request());
  try {
    const userGroups = await apiFetchTogglUserGroups(workspaceId);
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
    togglWorkspaceId,
  );
  if (userGroupsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyUserGroupsTransfer.request());

  const onUserGroupRecord = (userGroupRecord: any) => {
    const transferRecord = { ...userGroupRecord, type: EntityType.UserGroup };
    dispatch(updateInTransferEntity(transferRecord));
  };

  try {
    const userGroups = await batchClockifyRequests(
      onUserGroupRecord,
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
