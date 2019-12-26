import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { fetchObject } from "~/utils";
import {
  paginatedClockifyFetch,
  createEntitiesForTool,
  fetchEntitiesForTool,
} from "~/redux/sagaUtils";
import { ClientModel } from "~/clients/clientsTypes";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";

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
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceClients,
    creatorFunc: createClockifyClient,
  });
}

/**
 * Fetches all clients in Clockify workspaces and returns result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-get
 */
export function* fetchClockifyClientsSaga(): SagaIterator<ClientModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    fetchFunc: fetchClockifyClientsInWorkspace,
  });
}

function* createClockifyClient(
  sourceClient: ClientModel,
  workspaceId: string,
): SagaIterator<ClientModel | null> {
  const clientRequest = transformToRequest(sourceClient);
  const targetClient = yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/clients`,
    { method: HttpMethod.Post, body: clientRequest },
  );

  return transformFromResponse(targetClient);
}

function* fetchClockifyClientsInWorkspace(
  workspaceId: string,
): SagaIterator<ClientModel[]> {
  const clockifyClients: ClockifyClientResponseModel[] = yield call(
    paginatedClockifyFetch,
    `/clockify/api/v1/workspaces/${workspaceId}/clients`,
  );

  return clockifyClients.map(transformFromResponse);
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
