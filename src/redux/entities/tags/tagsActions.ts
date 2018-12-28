import { createAction } from 'redux-actions';
import { apiFetchClockifyTags, apiFetchTogglTags } from '../api/tags';
import { showFetchErrorNotification } from '../../app/appActions';
import { Dispatch } from '../../rootReducer';

export const clockifyTagsFetchStarted = createAction(
  '@tags/CLOCKIFY_FETCH_STARTED',
);
export const clockifyTagsFetchSuccess = createAction(
  '@tags/CLOCKIFY_FETCH_SUCCESS',
);
export const clockifyTagsFetchFailure = createAction(
  '@tags/CLOCKIFY_FETCH_FAILURE',
);
export const togglTagsFetchStarted = createAction(
  '@tags/TOGGL_FETCH_STARTED',
);
export const togglTagsFetchSuccess = createAction(
  '@tags/TOGGL_FETCH_SUCCESS',
);
export const togglTagsFetchFailure = createAction(
  '@tags/TOGGL_FETCH_FAILURE',
);

export const fetchClockifyTags = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyTagsFetchStarted());
  try {
    const response = await apiFetchClockifyTags(workspaceId);
    return dispatch(clockifyTagsFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTagsFetchFailure());
  }
};

export const fetchTogglTags = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglTagsFetchStarted());
  try {
    const response = await apiFetchTogglTags(workspaceId);
    return dispatch(togglTagsFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTagsFetchFailure());
  }
};
