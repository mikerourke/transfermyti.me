import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import {
  fetchObject,
  fetchPaginatedFromClockify,
} from "~/entityOperations/fetchActions";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { ClientModel, EntityGroup, ToolName } from "~/typeDefs";

interface ClockifyClientResponseModel {
  id: string;
  name: string;
  workspaceId: string;
}

/**
 * Creates new Clockify clients in all target workspaces and returns array of
 * transformed clients.
 */
export function* createClockifyClientsSaga(
  sourceClients: ClientModel[],
): SagaIterator<ClientModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceClients,
    apiCreateFunc: createClockifyClient,
  });
}

/**
 * Deletes all specified source clients from Clockify.
 */
export function* deleteClockifyClientsSaga(
  sourceClients: ClientModel[],
): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceClients,
    apiDeleteFunc: deleteClockifyClient,
  });
}

/**
 * Fetches all clients in Clockify workspaces and returns array of transformed
 * clients.
 */
export function* fetchClockifyClientsSaga(): SagaIterator<ClientModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyClientsInWorkspace,
  });
}

/**
 * Creates a new Clockify client.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-post
 */
function* createClockifyClient(
  sourceClient: ClientModel,
  targetWorkspaceId: string,
): SagaIterator<ClientModel> {
  const clientRequest = { name: sourceClient.name };
  const clockifyClient = yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/clients`,
    { method: "POST", body: clientRequest },
  );

  return transformFromResponse(clockifyClient);
}

/**
 * Deletes the specified Clockify client.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients--clientId--delete
 */
function* deleteClockifyClient(sourceClient: ClientModel): SagaIterator {
  const { workspaceId, id } = sourceClient;
  yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/clients/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify clients in specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-get
 */
function* fetchClockifyClientsInWorkspace(
  workspaceId: string,
): SagaIterator<ClientModel[]> {
  const clockifyClients: ClockifyClientResponseModel[] = yield call(
    fetchPaginatedFromClockify,
    `/clockify/api/workspaces/${workspaceId}/clients`,
  );

  return clockifyClients.map(transformFromResponse);
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
