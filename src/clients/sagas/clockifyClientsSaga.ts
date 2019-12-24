import { call, delay, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import { fetchObject } from "~/utils";
import {
  incrementTransferCounts,
  paginatedClockifyFetch,
  startGroupTransfer,
} from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import {
  createClockifyClients,
  fetchClockifyClients,
} from "~/clients/clientsActions";
import { selectTargetClientsForTransfer } from "~/clients/clientsSelectors";
import { ClientModel } from "~/clients/clientsTypes";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";

interface ClockifyClientResponseModel {
  id: string;
  name: string;
  workspaceId: string;
}

interface ClockifyClientRequestModel {
  name: string;
}

export function* createClockifyClientsSaga(
  action: ActionType<typeof createClockifyClients.request>,
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
      yield call(createClockifyClient, workspaceId, client);
      yield delay(500);
    }

    yield put(createClockifyClients.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClockifyClients.failure());
  }
}

/**
 * Fetches all clients in Clockify workspace and updates state with result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-get
 */
export function* fetchClockifyClientsSaga(
  action: ActionType<typeof fetchClockifyClients.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const clockifyClients: ClockifyClientResponseModel[] = yield call(
      paginatedClockifyFetch,
      `/clockify/api/v1/workspaces/${workspaceId}/clients`,
    );

    const recordsById: Record<string, ClientModel> = {};

    for (const clockifyClient of clockifyClients) {
      recordsById[clockifyClient.id] = transformFromResponse(
        clockifyClient,
        workspaceId,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Clockify);

    yield put(fetchClockifyClients.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClockifyClients.failure());
  }
}

/**
 * Creates a Clockify client and returns the response as { [New Client] }.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-post
 */
function* createClockifyClient(
  workspaceId: string,
  client: ClientModel,
): SagaIterator {
  const clientRequest = transformToRequest(client);
  yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/clients`,
    { method: HttpMethod.Post, body: clientRequest },
  );
}

function transformToRequest(client: ClientModel): ClockifyClientRequestModel {
  return {
    name: client.name,
  };
}

function transformFromResponse(
  client: ClockifyClientResponseModel,
  workspaceId: string,
): ClientModel {
  return {
    id: client.id,
    name: client.name,
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Clients,
  };
}
