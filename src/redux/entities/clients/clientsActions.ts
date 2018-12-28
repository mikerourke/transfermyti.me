import { createAction } from 'redux-actions';
import { apiFetchClockifyClients, apiFetchTogglClients } from '../api/clients';
import { showFetchErrorNotification } from '../../app/appActions';
import { Dispatch } from '../../rootReducer';

export const clockifyClientsFetchStarted = createAction(
  '@clients/CLOCKIFY_FETCH_STARTED',
);
export const clockifyClientsFetchSuccess = createAction(
  '@clients/CLOCKIFY_FETCH_SUCCESS',
);
export const clockifyClientsFetchFailure = createAction(
  '@clients/CLOCKIFY_FETCH_FAILURE',
);
export const togglClientsFetchStarted = createAction(
  '@clients/TOGGL_FETCH_STARTED',
);
export const togglClientsFetchSuccess = createAction(
  '@clients/TOGGL_FETCH_SUCCESS',
);
export const togglClientsFetchFailure = createAction(
  '@clients/TOGGL_FETCH_FAILURE',
);

export const fetchClockifyClients = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyClientsFetchStarted());
  try {
    const response = await apiFetchClockifyClients(workspaceId);
    return dispatch(clockifyClientsFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyClientsFetchFailure());
  }
};

export const fetchTogglClients = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglClientsFetchStarted());
  try {
    const response = await apiFetchTogglClients(workspaceId);
    return dispatch(togglClientsFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglClientsFetchFailure());
  }
};
