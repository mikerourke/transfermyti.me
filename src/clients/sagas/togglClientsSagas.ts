import { SagaIterator } from "@redux-saga/types";
import { call } from "redux-saga/effects";
import {
  createEntitiesForTool,
  fetchArray,
  fetchEntitiesForTool,
  fetchObject,
} from "~/redux/sagaUtils";
import { ClientModel } from "~/clients/clientsTypes";
import { EntityGroup, ToolName } from "~/allEntities/allEntitiesTypes";

interface TogglClientResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

/**
 * Creates new Toggl clients that correspond to source and returns array of
 * transformed clients.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/clients.md#create-a-client
 */
export function* createTogglClientsSaga(
  sourceClients: ClientModel[],
): SagaIterator<ClientModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceClients,
    apiCreateFunc: createTogglClient,
  });
}

/**
 * Fetches all clients in Toggl workspaces and returns returns array of
 * transformed clients.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-clients
 */
export function* fetchTogglClientsSaga(): SagaIterator<ClientModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglClientsInWorkspace,
  });
}

function* createTogglClient(
  sourceClient: ClientModel,
  targetWorkspaceId: string,
): SagaIterator<ClientModel> {
  const clientRequest = {
    name: sourceClient.name,
    wid: +targetWorkspaceId,
  };

  const { data } = yield call(fetchObject, "/toggl/api/clients", {
    method: "POST",
    body: clientRequest,
  });

  return transformFromResponse(data);
}

function* fetchTogglClientsInWorkspace(
  workspaceId: string,
): SagaIterator<ClientModel[]> {
  const togglClients: TogglClientResponseModel[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/clients`,
  );

  return togglClients.map(transformFromResponse);
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
