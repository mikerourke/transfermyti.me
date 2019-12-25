import { call, delay } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { TOGGL_API_DELAY } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { incrementCurrentTransferCount } from "~/app/appActions";
import { ClientModel } from "~/clients/clientsTypes";
import { EntityGroup, HttpMethod } from "~/common/commonTypes";

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

/**
 * Creates new Toggl clients that correspond to source and returns an array of
 * transformed clients.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/clients.md#create-a-client
 */
export function* createTogglClientsSaga(
  sourceClients: ClientModel[],
): SagaIterator<ClientModel[]> {
  const targetClients: ClientModel[] = [];

  for (const sourceClient of sourceClients) {
    yield call(incrementCurrentTransferCount);

    const clientRequest = transformToRequest(sourceClient);
    const { data } = yield call(fetchObject, `/toggl/api/clients`, {
      method: HttpMethod.Post,
      body: clientRequest,
    });
    targetClients.push(transformFromResponse(data));

    yield delay(TOGGL_API_DELAY);
  }

  return targetClients;
}

/**
 * Fetches all clients in Toggl workspaces and returns result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-clients
 */
export function* fetchTogglClientsSaga(
  workspaceIds: string[],
): SagaIterator<ClientModel[]> {
  const allTogglClients: ClientModel[] = [];
  if (workspaceIds.length === 0) {
    return [];
  }

  for (const workspaceId of workspaceIds) {
    const togglClients: TogglClientResponseModel[] = yield call(
      fetchArray,
      `/toggl/api/workspaces/${workspaceId}/clients`,
    );

    allTogglClients.push(...togglClients.map(transformFromResponse));
  }

  return allTogglClients;
}

function transformToRequest(client: ClientModel): TogglClientRequestModel {
  return {
    name: client.name,
    wid: +client.workspaceId,
  };
}

function transformFromResponse(client: TogglClientResponseModel): ClientModel {
  return {
    id: client.id.toString(),
    name: client.name,
    workspaceId: client.wid.toString(),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Clients,
  };
}
