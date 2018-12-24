import { createAction } from 'redux-actions';
import {
  apiFetchClockifyWorkspaces,
  apiFetchTogglWorkspaces,
} from '../api/workspaces';
import { Dispatch } from '../../rootReducer';
import { showErrorNotification } from '../../app/appActions';

export const fetchClockifyWorkspacesStarted = createAction(
  '@workspaces/FETCH_CLOCKIFY_STARTED',
);
export const fetchClockifyWorkspacesSuccess = createAction(
  '@workspaces/FETCH_CLOCKIFY_SUCCESS',
);
export const fetchClockifyWorkspacesFailure = createAction(
  '@workspaces/FETCH_CLOCKIFY_FAILURE',
);
export const fetchTogglWorkspacesStarted = createAction(
  '@workspaces/FETCH_TOGGL_STARTED',
);
export const fetchTogglWorkspacesSuccess = createAction(
  '@workspaces/FETCH_TOGGL_SUCCESS',
);
export const fetchTogglWorkspacesFailure = createAction(
  '@workspaces/FETCH_TOGGL_FAILURE',
);
export const updateIsWorkspaceSelected = createAction(
  '@workspaces/UPDATE_IS_SELECTED',
);

export const fetchClockifyWorkspaces = () => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(fetchClockifyWorkspacesStarted());
  try {
    const response = await apiFetchClockifyWorkspaces();
    return dispatch(fetchClockifyWorkspacesSuccess(response));
  } catch (error) {
    dispatch(showErrorNotification(error));
    return dispatch(fetchClockifyWorkspacesFailure());
  }
};

export const fetchTogglWorkspaces = () => async (dispatch: Dispatch<any>) => {
  dispatch(fetchTogglWorkspacesStarted());
  try {
    const response = await apiFetchTogglWorkspaces();
    return dispatch(fetchTogglWorkspacesSuccess(response));
  } catch (error) {
    dispatch(showErrorNotification(error));
    return dispatch(fetchTogglWorkspacesFailure());
  }
};
