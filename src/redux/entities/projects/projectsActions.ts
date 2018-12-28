import { createAction } from 'redux-actions';
import { apiFetchClockifyProjects, apiFetchTogglProjects } from '../api/projects';
import { showFetchErrorNotification } from '../../app/appActions';
import { Dispatch } from '../../rootReducer';

export const clockifyProjectsFetchStarted = createAction(
  '@projects/CLOCKIFY_FETCH_STARTED',
);
export const clockifyProjectsFetchSuccess = createAction(
  '@projects/CLOCKIFY_FETCH_SUCCESS',
);
export const clockifyProjectsFetchFailure = createAction(
  '@projects/CLOCKIFY_FETCH_FAILURE',
);
export const togglProjectsFetchStarted = createAction(
  '@projects/TOGGL_FETCH_STARTED',
);
export const togglProjectsFetchSuccess = createAction(
  '@projects/TOGGL_FETCH_SUCCESS',
);
export const togglProjectsFetchFailure = createAction(
  '@projects/TOGGL_FETCH_FAILURE',
);

export const fetchClockifyProjects = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyProjectsFetchStarted());
  try {
    const response = await apiFetchClockifyProjects(workspaceId);
    return dispatch(clockifyProjectsFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyProjectsFetchFailure());
  }
};

export const fetchTogglProjects = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglProjectsFetchStarted());
  try {
    const response = await apiFetchTogglProjects(workspaceId);
    return dispatch(togglProjectsFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglProjectsFetchFailure());
  }
};
