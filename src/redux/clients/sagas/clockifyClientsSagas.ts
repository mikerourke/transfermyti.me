import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchObject, fetchPaginatedFromClockify } from "~/api/apiRequests";
import { createEntitiesForTool } from "~/api/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/api/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/api/fetchEntitiesForTool";
import { EntityGroup, ToolName, type Client } from "~/types";

type ClockifyClientResponse = {
  address: string | null;
  archived: boolean;
  currencyCode: string;
  currencyId: string;
  email: string | null;
  id: string;
  name: string;
  note: string | null;
  workspaceId: string;
};

/**
 * Creates new Clockify clients in all target workspaces and returns array of
 * transformed clients.
 */
export function* createClockifyClientsSaga(
  sourceClients: Client[],
): SagaIterator<Client[]> {
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
  sourceClients: Client[],
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
export function* fetchClockifyClientsSaga(): SagaIterator<Client[]> {
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
  sourceClient: Client,
  targetWorkspaceId: string,
): SagaIterator<Client> {
  const body = { name: sourceClient.name };

  const clockifyClient = yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/clients`,
    { method: "POST", body },
  );

  return transformFromResponse(clockifyClient);
}

/**
 * Deletes the specified Clockify client.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients--clientId--delete
 */
function* deleteClockifyClient(sourceClient: Client): SagaIterator {
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
): SagaIterator<Client[]> {
  const clockifyClients: ClockifyClientResponse[] = yield call(
    fetchPaginatedFromClockify,
    `/clockify/api/workspaces/${workspaceId}/clients`,
  );

  return clockifyClients.map(transformFromResponse);
}

function transformFromResponse(client: ClockifyClientResponse): Client {
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
