import { createAsyncAction, createAction } from "typesafe-actions";
import { batchClockifyTransferRequests, paginatedFetch } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  apiCreateClockifyClient,
  apiFetchClockifyClients,
  apiFetchTogglClients,
} from "./clientsApi";
import { selectClientsTransferPayloadForWorkspace } from "./clientsSelectors";
import { EntitiesFetchPayloadModel, EntityGroup } from "~/common/commonTypes";
import { ReduxDispatch, ReduxGetState } from "~/redux/reduxTypes";
import { ClockifyClientModel, TogglClientModel } from "./clientsTypes";

export const clockifyClientsFetch = createAsyncAction(
  "@clients/CLOCKIFY_FETCH_REQUEST",
  "@clients/CLOCKIFY_FETCH_SUCCESS",
  "@clients/CLOCKIFY_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyClientModel>, void>();

export const togglClientsFetch = createAsyncAction(
  "@clients/TOGGL_FETCH_REQUEST",
  "@clients/TOGGL_FETCH_SUCCESS",
  "@clients/TOGGL_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<TogglClientModel>, void>();

export const clockifyClientsTransfer = createAsyncAction(
  "@clients/CLOCKIFY_TRANSFER_REQUEST",
  "@clients/CLOCKIFY_TRANSFER_SUCCESS",
  "@clients/CLOCKIFY_TRANSFER_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyClientModel>, void>();

export const flipIsClientIncluded = createAction("@clients/FLIP_IS_INCLUDED")<
  string
>();

export const fetchClockifyClients = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyClientsFetch.request());

  try {
    const clients = await paginatedFetch({
      apiFetchFunc: apiFetchClockifyClients,
      funcArgs: [workspaceId],
    });
    dispatch(
      clockifyClientsFetch.success({ entityRecords: clients, workspaceId }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyClientsFetch.failure());
  }
};

export const fetchTogglClients = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglClientsFetch.request());

  try {
    const clients = await apiFetchTogglClients(workspaceId);
    dispatch(
      togglClientsFetch.success({ entityRecords: clients, workspaceId }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(togglClientsFetch.failure());
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
  if (clientsInWorkspace.length === 0) {
    return;
  }

  dispatch(clockifyClientsTransfer.request());

  try {
    const clients = await batchClockifyTransferRequests({
      requestsPerSecond: 4,
      dispatch,
      entityGroup: EntityGroup.Clients,
      entityRecordsInWorkspace: clientsInWorkspace,
      apiFunc: apiCreateClockifyClient,
      clockifyWorkspaceId,
      togglWorkspaceId,
    });

    dispatch(
      clockifyClientsTransfer.success({
        entityRecords: clients,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyClientsTransfer.failure());
  }
};