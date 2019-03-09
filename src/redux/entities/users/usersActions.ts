import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import {
  apiAddClockifyUsersToWorkspace,
  apiFetchClockifyUsersInWorkspace,
  apiFetchTogglUsersInWorkspace,
} from '~/redux/entities/api/users';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectUsersTransferPayloadForWorkspace } from './usersSelectors';
import { appendUserIdsToWorkspace } from '~/redux/entities/workspaces/workspacesActions';
import { ReduxDispatch, ReduxGetState, ToolName } from '~/types/commonTypes';
import { ClockifyUser, TogglUser } from '~/types/usersTypes';

export const clockifyUsersFetch = createAsyncAction(
  '@users/CLOCKIFY_FETCH_REQUEST',
  '@users/CLOCKIFY_FETCH_SUCCESS',
  '@users/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyUser[], void>();

export const togglUsersFetch = createAsyncAction(
  '@users/TOGGL_FETCH_REQUEST',
  '@users/TOGGL_FETCH_SUCCESS',
  '@users/TOGGL_FETCH_FAILURE',
)<void, TogglUser[], void>();

export const clockifyUsersTransfer = createAsyncAction(
  '@users/CLOCKIFY_TRANSFER_REQUEST',
  '@users/CLOCKIFY_TRANSFER_SUCCESS',
  '@users/CLOCKIFY_TRANSFER_FAILURE',
)<void, void, void>();

export const updateIsUserIncluded = createStandardAction(
  '@users/UPDATE_IS_INCLUDED',
)<string>();

const appendUserIdsToWorkspaceForTool = (
  toolName: ToolName,
  users: (ClockifyUser | TogglUser)[],
  workspaceId: string,
) => (dispatch: ReduxDispatch) => {
  const userIds = users.map(({ id }) => id.toString());
  return dispatch(appendUserIdsToWorkspace({ toolName, workspaceId, userIds }));
};

export const fetchClockifyUsers = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyUsersFetch.request());
  try {
    const users = await apiFetchClockifyUsersInWorkspace(workspaceId);
    dispatch(
      appendUserIdsToWorkspaceForTool(ToolName.Clockify, users, workspaceId),
    );
    return dispatch(clockifyUsersFetch.success(users));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUsersFetch.failure());
  }
};

export const fetchTogglUsers = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglUsersFetch.request());
  try {
    const users = await apiFetchTogglUsersInWorkspace(workspaceId);
    dispatch(
      appendUserIdsToWorkspaceForTool(ToolName.Toggl, users, workspaceId),
    );
    return dispatch(togglUsersFetch.success(users));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglUsersFetch.failure());
  }
};

export const transferUsersToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const userEmailsToTransfer = selectUsersTransferPayloadForWorkspace(
    state,
    togglWorkspaceId,
  );
  if (userEmailsToTransfer.length === 0) return Promise.resolve();

  dispatch(clockifyUsersTransfer.request());
  try {
    await apiAddClockifyUsersToWorkspace(clockifyWorkspaceId, {
      emails: userEmailsToTransfer,
    });
    await dispatch(fetchClockifyUsers(clockifyWorkspaceId));

    return dispatch(clockifyUsersTransfer.success());
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUsersTransfer.failure());
  }
};
