import { createAction } from 'redux-actions';
import { batchClockifyRequests } from '~/redux/utils';
import {
  apiCreateClockifyClient,
  apiFetchClockifyClients,
  apiFetchTogglClients,
} from '../api/clients';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectClientsTransferPayloadForWorkspace } from './clientsSelectors';
import { ClockifyClient, TogglClient } from '~/types/clientsTypes';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';

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
export const clockifyClientsTransferStarted = createAction(
  '@clients/CLOCKIFY_CLIENTS_TRANSFER_STARTED',
);
export const clockifyClientsTransferSuccess = createAction(
  '@clients/CLOCKIFY_CLIENTS_TRANSFER_SUCCESS',
  (clients: ClockifyClient[]) => clients,
);
export const clockifyClientsTransferFailure = createAction(
  '@clients/CLOCKIFY_CLIENTS_TRANSFER_FAILURE',
);
export const updateIsClientIncluded = createAction(
  '@clients/UPDATE_IS_INCLUDED',
  (clientId: string) => clientId,
);

export const fetchClockifyClients = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
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

export const fetchTogglClients = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
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

export const transferClientsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const clientRecordsInWorkspace = selectClientsTransferPayloadForWorkspace(
    state,
    togglWorkspaceId,
  );
  if (clientRecordsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyClientsTransferStarted());
  try {
    const clients = await batchClockifyRequests(
      clientRecordsInWorkspace,
      apiCreateClockifyClient,
      clockifyWorkspaceId,
    );
    return dispatch(clockifyClientsTransferSuccess(clients));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyClientsTransferFailure());
  }
};
