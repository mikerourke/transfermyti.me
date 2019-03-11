import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { batchClockifyRequests } from '~/redux/utils';
import {
  apiCreateClockifyClient,
  apiFetchClockifyClients,
  apiFetchTogglClients,
} from '../api/clients';
import {
  showFetchErrorNotification,
  updateInTransferEntity,
} from '~/redux/app/appActions';
import { selectClientsTransferPayloadForWorkspace } from './clientsSelectors';
import { ClockifyClient, TogglClient } from '~/types/clientsTypes';
import { EntityType, ReduxDispatch, ReduxGetState } from '~/types/commonTypes';

export const clockifyClientsFetch = createAsyncAction(
  '@clients/CLOCKIFY_FETCH_REQUEST',
  '@clients/CLOCKIFY_FETCH_SUCCESS',
  '@clients/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyClient[], void>();

export const togglClientsFetch = createAsyncAction(
  '@clients/TOGGL_FETCH_REQUEST',
  '@clients/TOGGL_FETCH_SUCCESS',
  '@clients/TOGGL_FETCH_FAILURE',
)<void, TogglClient[], void>();

export const clockifyClientsTransfer = createAsyncAction(
  '@clients/CLOCKIFY_TRANSFER_REQUEST',
  '@clients/CLOCKIFY_TRANSFER_SUCCESS',
  '@clients/CLOCKIFY_TRANSFER_FAILURE',
)<void, ClockifyClient[], void>();

export const updateIsClientIncluded = createStandardAction(
  '@clients/UPDATE_IS_INCLUDED',
)<string>();

export const fetchClockifyClients = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyClientsFetch.request());
  try {
    const clients = await apiFetchClockifyClients(workspaceId);
    return dispatch(clockifyClientsFetch.success(clients));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyClientsFetch.failure());
  }
};

export const fetchTogglClients = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglClientsFetch.request());
  try {
    const clients = await apiFetchTogglClients(workspaceId);
    return dispatch(togglClientsFetch.success(clients));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglClientsFetch.failure());
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

  dispatch(clockifyClientsTransfer.request());

  const onClientRecord = (clientRecord: any) => {
    const transferRecord = { ...clientRecord, type: EntityType.Client };
    dispatch(updateInTransferEntity(transferRecord));
  };

  try {
    const clients = await batchClockifyRequests(
      onClientRecord,
      clientRecordsInWorkspace,
      apiCreateClockifyClient,
      clockifyWorkspaceId,
    );
    return dispatch(clockifyClientsTransfer.success(clients));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyClientsTransfer.failure());
  }
};
