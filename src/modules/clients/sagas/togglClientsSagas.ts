import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import {
  fetchArray,
  fetchEmpty,
  fetchObject,
} from "~/entityOperations/apiRequests";
import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { type Client, EntityGroup, ToolName } from "~/typeDefs";
import { validStringify } from "~/utilities/textTransforms";

interface TogglClientResponse {
  id: number;
  wid: number;
  name: string;
  at: string;
}

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
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/clients.md#create-a-client
 */
function* createTogglClient(
  sourceClient: Client,
  targetWorkspaceId: string,
): SagaIterator<Client> {
  const clientRequest = {
    client: {
      name: sourceClient.name,
      wid: +targetWorkspaceId,
    },
  };

  const { data } = yield call(fetchObject, "/toggl/api/clients", {
    method: "POST",
    body: clientRequest,
  });

  return transformFromResponse(data);
}

/**
 * Deletes the specified Toggl client.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/clients.md#delete-a-client
 */
function* deleteTogglClient(sourceClient: Client): SagaIterator {
  yield call(fetchEmpty, `/toggl/api/clients/${sourceClient.id}`, {
    method: "DELETE",
  });
}

/**
 * Fetches Toggl clients in the specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-clients
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
