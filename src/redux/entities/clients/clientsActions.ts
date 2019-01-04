import { createAction } from 'redux-actions';
import { apiFetchClockifyClients, apiFetchTogglClients } from '../api/clients';
import { showFetchErrorNotification } from '../../app/appActions';
import {
  selectClockifyLinkedClientsById,
  selectTogglIncludedClientRecords,
} from './clientsSelectors';
import { ClockifyClient, TogglClient } from '../../../types/clientsTypes';
import { Dispatch, GetState } from '../../rootReducer';

export const clockifyClientsFetchStarted = createAction(
  '@clients/CLOCKIFY_FETCH_STARTED',
);
export const clockifyClientsFetchSuccess = createAction(
  '@clients/CLOCKIFY_FETCH_SUCCESS',
  (clients: ClockifyClient[]) => clients,
);
export const clockifyClientsFetchFailure = createAction(
  '@clients/CLOCKIFY_FETCH_FAILURE',
);
export const togglClientsFetchStarted = createAction(
  '@clients/TOGGL_FETCH_STARTED',
);
export const togglClientsFetchSuccess = createAction(
  '@clients/TOGGL_FETCH_SUCCESS',
  (clients: TogglClient[]) => clients,
);
export const togglClientsFetchFailure = createAction(
  '@clients/TOGGL_FETCH_FAILURE',
);
export const updateIsClientIncluded = createAction(
  '@clients/UPDATE_IS_INCLUDED',
  (clientId: string) => clientId,
);

export const fetchClockifyClients = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyClientsFetchStarted());
  try {
    const clients = await apiFetchClockifyClients(workspaceId);
    return dispatch(clockifyClientsFetchSuccess(clients));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyClientsFetchFailure());
  }
};

export const transferAllClientsToClockify = () => async (
  dispatch: Dispatch<any>,
  getState: GetState,
) => {
  const state = getState();
  const togglIncludedRecords = selectTogglIncludedClientRecords(state);
  const clockifyClientsById = selectClockifyLinkedClientsById(state);
};

export const fetchTogglClients = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglClientsFetchStarted());
  try {
    const clients = await apiFetchTogglClients(workspaceId);
    return dispatch(togglClientsFetchSuccess(clients));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglClientsFetchFailure());
  }
};
