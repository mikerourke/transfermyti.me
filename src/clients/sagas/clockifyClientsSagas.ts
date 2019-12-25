import { call, delay } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { CLOCKIFY_API_DELAY } from "~/constants";
import { fetchObject } from "~/utils";
import { paginatedClockifyFetch } from "~/redux/sagaUtils";
import { incrementCurrentTransferCount } from "~/app/appActions";
import { ClientModel } from "~/clients/clientsTypes";
import { EntityGroup, HttpMethod } from "~/common/commonTypes";

interface ClockifyClientResponseModel {
  id: string;
  name: string;
  workspaceId: string;
}

interface ClockifyClientRequestModel {
  name: string;
}

/**
 * Creates new Clockify clients in all target workspaces and returns an array of
 * transformed clients.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-post
 */
export function* createClockifyClientsSaga(
  sourceClients: ClientModel[],
): SagaIterator<ClientModel[]> {
  const targetClients: ClientModel[] = [];

  for (const sourceClient of sourceClients) {
    yield call(incrementCurrentTransferCount);

    const clientRequest = transformToRequest(sourceClient);
    const targetClient = yield call(
      fetchObject,
      `/clockify/api/v1/workspaces/${sourceClient.workspaceId}/clients`,
      { method: HttpMethod.Post, body: clientRequest },
    );
    targetClients.push(transformFromResponse(targetClient));

    yield delay(CLOCKIFY_API_DELAY);
  }

  return targetClients;
}

/**
 * Fetches all clients in Clockify workspaces and returns result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-get
 */
export function* fetchClockifyClientsSaga(
  workspaceIds: string[],
): SagaIterator<ClientModel[]> {
  const allClockifyClients: ClientModel[] = [];
  if (workspaceIds.length === 0) {
    return [];
  }

  for (const workspaceId of workspaceIds) {
    const clockifyClients: ClockifyClientResponseModel[] = yield call(
      paginatedClockifyFetch,
      `/clockify/api/v1/workspaces/${workspaceId}/clients`,
    );

    allClockifyClients.push(...clockifyClients.map(transformFromResponse));
  }

  return allClockifyClients;
}

function transformToRequest(client: ClientModel): ClockifyClientRequestModel {
  return {
    name: client.name,
  };
}

function transformFromResponse(
  client: ClockifyClientResponseModel,
): ClientModel {
  return {
    id: client.id,
    name: client.name,
    workspaceId: client.workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Clients,
  };
}
