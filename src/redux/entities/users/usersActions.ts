import { createAction } from 'redux-actions';
import {
  apiFetchClockifyUsersInWorkspace,
  apiFetchTogglUsersInWorkspace,
} from '../api/users';
import { showFetchErrorNotification } from '../../app/appActions';
import { appendUserIdsToWorkspace } from '../workspaces/workspacesActions';
import { ToolName } from '../../../types/commonTypes';
import { ClockifyUser, TogglUser } from '../../../types/usersTypes';
import { Dispatch } from '../../rootReducer';

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
  (users: TogglUser[]) => users,
);
export const togglUsersFetchFailure = createAction(
  '@users/TOGGL_FETCH_FAILURE',
);
export const updateIsUserIncluded = createAction(
  '@users/UPDATE_IS_INCLUDED',
  (userId: string) => userId,
);

const addUsersToWorkspace = (
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
    dispatch(addUsersToWorkspace(ToolName.Clockify, users, workspaceId));
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
    dispatch(addUsersToWorkspace(ToolName.Toggl, users, workspaceId));
    return dispatch(togglUsersFetchSuccess(users));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglUsersFetchFailure());
  }
};
