import { createAction } from 'redux-actions';
import first from 'lodash/first';
import {
  apiFetchClockifyUserDetails,
  apiFetchTogglUserDetails,
} from '../api/user';
import {
  apiFetchClockifyWorkspaces,
  apiFetchClockifyWorkspaceUsers, apiFetchTogglWorkspaceUsers
} from '../api/workspaces';
import {
  appendUsersToWorkspace,
  clockifyWorkspacesFetchSuccess,
  togglWorkspacesFetchSuccess,
} from '../workspaces/workspacesActions';
import { ClockifyUser, TogglMeResponse } from '../../../types/userTypes';
import { Dispatch } from '../../rootReducer';

export const clockifyUserDetailsFetchStarted = createAction(
  '@user/CLOCKIFY_USER_DETAILS_FETCH_STARTED',
);
export const clockifyUserDetailsFetchSuccess = createAction(
  '@user/CLOCKIFY_USER_DETAILS_FETCH_SUCCESS',
  (response: ClockifyUser) => response,
);
export const clockifyUserDetailsFetchFailure = createAction(
  '@user/CLOCKIFY_USER_DETAILS_FETCH_FAILURE',
);
export const togglUserDetailsFetchStarted = createAction(
  '@user/TOGGL_USER_DETAILS_FETCH_STARTED',
);
export const togglUserDetailsFetchSuccess = createAction(
  '@user/TOGGL_USER_DETAILS_FETCH_SUCCESS',
  (response: TogglMeResponse) => response,
);
export const togglUserDetailsFetchFailure = createAction(
  '@user/TOGGL_USER_DETAILS_FETCH_FAILURE',
);

export const fetchClockifyUserDetails = () => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyUserDetailsFetchStarted());
  try {
    const workspaces = await apiFetchClockifyWorkspaces();
    const validMemberships = first(workspaces).memberships.filter(
      ({ membershipType }) => membershipType === 'WORKSPACE',
    );
    if (validMemberships.length === 0) {
      return dispatch(clockifyUserDetailsFetchFailure());
    }
    await appendUsersToWorkspace(workspaces, apiFetchClockifyWorkspaceUsers);
    dispatch(clockifyWorkspacesFetchSuccess(workspaces));

    const [{ userId }] = validMemberships;
    const userDetails = await apiFetchClockifyUserDetails(userId);
    return dispatch(clockifyUserDetailsFetchSuccess(userDetails));
  } catch (error) {
    dispatch(clockifyUserDetailsFetchFailure());
    throw error;
  }
};

export const fetchTogglUserDetails = () => async (dispatch: Dispatch<any>) => {
  dispatch(togglUserDetailsFetchStarted());
  try {
    const { data } = await apiFetchTogglUserDetails();
    const { id, email, workspaces } = data;
    await appendUsersToWorkspace(workspaces, apiFetchTogglWorkspaceUsers);
    dispatch(togglWorkspacesFetchSuccess(workspaces));
    return dispatch(togglUserDetailsFetchSuccess({ id, email }));
  } catch (error) {
    dispatch(togglUserDetailsFetchFailure());
    throw error;
  }
};
