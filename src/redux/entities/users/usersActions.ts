import { createAction } from 'redux-actions';
import {
  apiAddClockifyUsersToWorkspace,
  apiFetchClockifyUsersInWorkspace,
  apiFetchTogglUsersInWorkspace,
} from '../api/users';
import { showFetchErrorNotification } from '../../app/appActions';
import { selectUsersTransferPayloadForWorkspace } from './usersSelectors';
import { appendUserIdsToWorkspace } from '../workspaces/workspacesActions';
import { ToolName } from '../../../types/commonTypes';
import { ClockifyUser, TogglUser } from '../../../types/usersTypes';
import { Dispatch, GetState } from '../../rootReducer';

export const clockifyUsersFetchStarted = createAction(
  '@users/CLOCKIFY_FETCH_STARTED',
);
export const clockifyUsersFetchSuccess = createAction(
  '@users/CLOCKIFY_FETCH_SUCCESS',
  (users: ClockifyUser[]) => users,
);
export const clockifyUsersFetchFailure = createAction(
  '@users/CLOCKIFY_FETCH_FAILURE',
);
export const togglUsersFetchStarted = createAction(
  '@users/TOGGL_FETCH_STARTED',
);
export const togglUsersFetchSuccess = createAction(
  '@users/TOGGL_FETCH_SUCCESS',
  (users: ClockifyUser[]) => users,
);
export const togglUsersFetchFailure = createAction(
  '@users/TOGGL_FETCH_FAILURE',
);
export const clockifyUsersTransferStarted = createAction(
  '@users/CLOCKIFY_TRANSFER_STARTED',
);
export const clockifyUsersTransferSuccess = createAction(
  '@users/CLOCKIFY_TRANSFER_SUCCESS',
);
export const clockifyUsersTransferFailure = createAction(
  '@users/CLOCKIFY_TRANSFER_FAILURE',
);
export const updateIsUserIncluded = createAction(
  '@users/UPDATE_IS_INCLUDED',
  (userId: string) => userId,
);

const appendUserIdsToWorkspaceForTool = (
  toolName: ToolName,
  users: (ClockifyUser | TogglUser)[],
  workspaceId: string,
) => (dispatch: Dispatch<any>) => {
  const userIds = users.map(({ id }) => id.toString());
  return dispatch(appendUserIdsToWorkspace(toolName, workspaceId, userIds));
};

export const fetchClockifyUsers = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyUsersFetchStarted());
  try {
    const users = await apiFetchClockifyUsersInWorkspace(workspaceId);
    dispatch(
      appendUserIdsToWorkspaceForTool(ToolName.Clockify, users, workspaceId),
    );
    return dispatch(clockifyUsersFetchSuccess(users));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUsersFetchFailure());
  }
};

export const fetchTogglUsers = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglUsersFetchStarted());
  try {
    const users = await apiFetchTogglUsersInWorkspace(workspaceId);
    dispatch(
      appendUserIdsToWorkspaceForTool(ToolName.Toggl, users, workspaceId),
    );
    return dispatch(togglUsersFetchSuccess(users));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglUsersFetchFailure());
  }
};

export const transferUsersToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: Dispatch<any>, getState: GetState) => {
  const state = getState();
  const userEmailsToTransfer = selectUsersTransferPayloadForWorkspace(
    state,
    togglWorkspaceId,
  );
  if (userEmailsToTransfer.length === 0) return Promise.resolve();

  dispatch(clockifyUsersTransferStarted());
  try {
    await apiAddClockifyUsersToWorkspace(clockifyWorkspaceId, {
      emails: userEmailsToTransfer,
    });
    await dispatch(fetchClockifyUsers(clockifyWorkspaceId));

    return dispatch(clockifyUsersTransferSuccess());
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUsersTransferFailure());
  }
};
