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
import { ClientModel, ClockifyClient, TogglClient } from '~/types/clientsTypes';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';
import { EntityType } from '~/types/entityTypes';

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

export const flipIsClientIncluded = createStandardAction(
  '@clients/FLIP_IS_INCLUDED',
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
  const clientsInWorkspace = selectClientsTransferPayloadForWorkspace(state)(
    togglWorkspaceId,
  );
  if (clientsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyClientsTransfer.request());

  const onClient = (client: ClientModel) => {
    const transferRecord = { ...client, type: EntityType.Client };
    dispatch(updateInTransferEntity(transferRecord));
  };

  try {
    const clients = await batchClockifyRequests(
      onClient,
      clientsInWorkspace,
      apiCreateClockifyClient,
      clockifyWorkspaceId,
    );
    return dispatch(clockifyClientsTransfer.success(clients));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyClientsTransfer.failure());
  }
};
