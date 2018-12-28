import { createAction } from 'redux-actions';
import { apiFetchClockifyTasks, apiFetchTogglTasks } from '../api/tasks';
import { showFetchErrorNotification } from '../../app/appActions';
import { Dispatch } from '../../rootReducer';

export const clockifyTasksFetchStarted = createAction(
  '@tasks/CLOCKIFY_FETCH_STARTED',
);
export const clockifyTasksFetchSuccess = createAction(
  '@tasks/CLOCKIFY_FETCH_SUCCESS',
);
export const clockifyTasksFetchFailure = createAction(
  '@tasks/CLOCKIFY_FETCH_FAILURE',
);
export const togglTasksFetchStarted = createAction(
  '@tasks/TOGGL_FETCH_STARTED',
);
export const togglTasksFetchSuccess = createAction(
  '@tasks/TOGGL_FETCH_SUCCESS',
);
export const togglTasksFetchFailure = createAction(
  '@tasks/TOGGL_FETCH_FAILURE',
);

export const fetchClockifyTasks = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyTasksFetchStarted());
  try {
    const response = await apiFetchClockifyTasks(workspaceId);
    return dispatch(clockifyTasksFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTasksFetchFailure());
  }
};

export const fetchTogglTasks = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglTasksFetchStarted());
  try {
    const response = await apiFetchTogglTasks(workspaceId);
    if (response) return dispatch(togglTasksFetchSuccess(response));
    return Promise.resolve();
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTasksFetchFailure());
  }
};
