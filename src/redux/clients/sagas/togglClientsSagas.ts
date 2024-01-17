import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchArray, fetchEmpty, fetchObject } from "~/api/apiRequests";
import { createEntitiesForTool } from "~/api/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/api/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/api/fetchEntitiesForTool";
import { EntityGroup, ToolName, type Client } from "~/types";
import { validStringify } from "~/utilities/textTransforms";

/**
 * Response from Toggl API for clients.
 * @see https://developers.track.toggl.com/docs/api/clients#response
 */
type TogglClientResponse = {
  archived: boolean;
  at: string;
  id: number;
  name: string;
  server_deleted_at: string | null;
  wid: number;
};

/**
 * Creates new Toggl clients that correspond to source and returns array of
 * transformed clients.
 */
export function* createTogglClientsSaga(
  sourceClients: Client[],
): SagaIterator<Client[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceClients,
    apiCreateFunc: createTogglClient,
  });
}

/**
 * Deletes all specified source clients from Toggl.
 */
export function* deleteTogglClientsSaga(sourceClients: Client[]): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceClients,
    apiDeleteFunc: deleteTogglClient,
  });
}

/**
 * Fetches all clients in Toggl workspaces and returns array of transformed
 * clients.
 */
export function* fetchTogglClientsSaga(): SagaIterator<Client[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglClientsInWorkspace,
  });
}

/**
 * Creates a new Toggl client.
 * @see https://developers.track.toggl.com/docs/api/clients#post-create-client
 */
function* createTogglClient(
  sourceClient: Client,
  targetWorkspaceId: string,
): SagaIterator<Client> {
  const body = {
    name: sourceClient.name,
    wid: +targetWorkspaceId,
  };

  const togglClient = yield call(
    fetchObject,
    `/toggl/api/workspaces/${targetWorkspaceId}/clients`,
    { method: "POST", body },
  );

  return transformFromResponse(togglClient);
}

/**
 * Deletes the specified Toggl client.
 * @see https://developers.track.toggl.com/docs/api/clients#delete-delete-client
 */
function* deleteTogglClient(sourceClient: Client): SagaIterator {
  const { id, workspaceId } = sourceClient;

  yield call(fetchEmpty, `/toggl/api/workspaces/${workspaceId}/clients/${id}`, {
    method: "DELETE",
  });
}

/**
 * Fetches Toggl clients in the specified workspace.
 * @see https://developers.track.toggl.com/docs/api/clients#get-list-clients
 */
function* fetchTogglClientsInWorkspace(
  workspaceId: string,
): SagaIterator<Client[]> {
  const togglClients: TogglClientResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/clients`,
  );

  return togglClients.map(transformFromResponse);
}

function transformFromResponse(client: TogglClientResponse): Client {
  return {
    id: client.id.toString(),
    name: client.name,
    workspaceId: validStringify(client.wid, ""),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Clients,
  };
}
