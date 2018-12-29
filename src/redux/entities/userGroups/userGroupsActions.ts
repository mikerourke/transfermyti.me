import { createAction } from 'redux-actions';
import {
  apiFetchClockifyUserGroups,
  apiFetchTogglUserGroups,
} from '../api/userGroups';
import { showFetchErrorNotification } from '../../app/appActions';
import { Dispatch } from '../../rootReducer';

export const clockifyUserGroupsFetchStarted = createAction(
  '@userGroups/CLOCKIFY_FETCH_STARTED',
);
export const clockifyUserGroupsFetchSuccess = createAction(
  '@userGroups/CLOCKIFY_FETCH_SUCCESS',
);
export const clockifyUserGroupsFetchFailure = createAction(
  '@userGroups/CLOCKIFY_FETCH_FAILURE',
);
export const togglUserGroupsFetchStarted = createAction(
  '@userGroups/TOGGL_FETCH_STARTED',
);
export const togglUserGroupsFetchSuccess = createAction(
  '@userGroups/TOGGL_FETCH_SUCCESS',
);
export const togglUserGroupsFetchFailure = createAction(
  '@userGroups/TOGGL_FETCH_FAILURE',
);
export const updateIsUserGroupIncluded = createAction(
  '@userGroups/UPDATE_IS_INCLUDED',
  (userGroupId: string) => userGroupId,
);

export const fetchClockifyUserGroups = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyUserGroupsFetchStarted());
  try {
    const userGroups = await apiFetchClockifyUserGroups(workspaceId);
    return dispatch(clockifyUserGroupsFetchSuccess(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUserGroupsFetchFailure());
  }
};

export const fetchTogglUserGroups = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglUserGroupsFetchStarted());
  try {
    const userGroups = await apiFetchTogglUserGroups(workspaceId);
    return dispatch(togglUserGroupsFetchSuccess(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglUserGroupsFetchFailure());
  }
};
