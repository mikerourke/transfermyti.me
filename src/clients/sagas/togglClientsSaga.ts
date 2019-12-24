import { call, put, select, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import {
  createTogglClients,
  fetchTogglClients,
} from "~/clients/clientsActions";
import { selectTargetClientsForTransfer } from "~/clients/clientsSelectors";
import { ClientModel } from "~/clients/clientsTypes";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";

interface TogglClientResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

interface TogglClientRequestModel {
  name: string;
  wid: number;
}

export function* createTogglClientsSaga(
  action: ActionType<typeof createTogglClients.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const clients: ClientModel[] = yield select(
      selectTargetClientsForTransfer,
      workspaceId,
    );
    yield call(startGroupTransfer, EntityGroup.Clients, clients.length);

    for (const client of clients) {
      yield call(incrementTransferCounts);
      yield call(createTogglClient, client);
      yield delay(500);
    }

    yield put(createTogglClients.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTogglClients.failure());
  }
}

/**
 * Fetches all clients in Toggl workspace and updates state with result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-clients
 */
export function* fetchTogglClientsSaga(
  action: ActionType<typeof fetchTogglClients.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const togglClients: TogglClientResponseModel[] = yield call(
      fetchArray,
      `/toggl/api/workspaces/${workspaceId}/clients`,
    );

    const recordsById: Record<string, ClientModel> = {};

    for (const togglClient of togglClients) {
      const clientId = togglClient.id.toString();
      recordsById[clientId] = transformFromResponse(togglClient, workspaceId);
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Toggl);

    yield put(fetchTogglClients.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTogglClients.failure());
  }
}

/**
 * Creates a Toggl client and returns the response as { data: [New Client] }.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/clients.md#create-a-client
 */
function* createTogglClient(client: ClientModel): SagaIterator {
  const clientRequest = transformToRequest(client);
  yield call(fetchObject, `/toggl/api/clients`, {
    method: HttpMethod.Post,
    body: clientRequest,
  });
}

function transformToRequest(client: ClientModel): TogglClientRequestModel {
  return {
    name: client.name,
    wid: +client.workspaceId,
  };
}

function transformFromResponse(
  client: TogglClientResponseModel,
  workspaceId: string,
): ClientModel {
  return {
    id: client.id.toString(),
    name: client.name,
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Clients,
  };
}
