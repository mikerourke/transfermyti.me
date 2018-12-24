import { createAction } from 'redux-actions';
import first from 'lodash/first';
import {
  apiFetchClockifyUserDetails,
  apiFetchTogglUserDetails,
} from '../api/user';
import { apiFetchClockifyWorkspaces } from '../api/workspaces';
import { showErrorNotification } from '../../app/appActions';
import {
  fetchClockifyWorkspacesSuccess,
  fetchTogglWorkspacesSuccess,
} from '../workspaces/workspacesActions';
import { Dispatch } from '../../rootReducer';

export const fetchClockifyUserDetailsStarted = createAction(
  '@user/FETCH_CLOCKIFY_DETAILS_STARTED',
);
export const fetchClockifyUserDetailsSuccess = createAction(
  '@user/FETCH_CLOCKIFY_DETAILS_SUCCESS',
);
export const fetchClockifyUserDetailsFailure = createAction(
  '@user/FETCH_CLOCKIFY_DETAILS_FAILURE',
);
export const fetchTogglUserDetailsStarted = createAction(
  '@user/FETCH_TOGGL_DETAILS_STARTED',
);
export const fetchTogglUserDetailsSuccess = createAction(
  '@user/FETCH_TOGGL_DETAILS_SUCCESS',
);
export const fetchTogglUserDetailsFailure = createAction(
  '@user/FETCH_TOGGL_DETAILS_FAILURE',
);

export const fetchClockifyUserDetails = () => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(fetchClockifyUserDetailsStarted());
  try {
    const workspaces = await apiFetchClockifyWorkspaces();
    const validMemberships = first(workspaces).memberships.filter(
      ({ membershipType }) => membershipType === 'WORKSPACE',
    );
    if (validMemberships.length === 0) {
      return dispatch(fetchClockifyUserDetailsFailure());
    }
    dispatch(fetchClockifyWorkspacesSuccess(workspaces));

    const [{ userId }] = validMemberships;
    const userDetails = await apiFetchClockifyUserDetails(userId);
    return dispatch(fetchClockifyUserDetailsSuccess(userDetails));
  } catch (error) {
    dispatch(showErrorNotification(error));
    return dispatch(fetchClockifyUserDetailsFailure());
  }
};

export const fetchTogglUserDetails = () => async (dispatch: Dispatch<any>) => {
  dispatch(fetchTogglUserDetailsStarted());
  try {
    const { data } = await apiFetchTogglUserDetails();
    const { id, email, workspaces } = data;
    dispatch(fetchTogglWorkspacesSuccess(workspaces));
    return dispatch(fetchTogglUserDetailsSuccess({ id, email }));
  } catch (error) {
    dispatch(showErrorNotification(error));
    return dispatch(fetchTogglUserDetailsFailure());
  }
};
