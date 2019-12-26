import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { createEntitiesForTool, fetchEntitiesForTool } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { ClientModel } from "~/clients/clientsTypes";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";

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
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceClients,
    creatorFunc: createTogglClient,
  });
}

/**
 * Fetches all clients in Toggl workspaces and returns result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-clients
 */
export function* fetchTogglClientsSaga(): SagaIterator<ClientModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    fetchFunc: fetchTogglClientsInWorkspace,
  });
}

function* createTogglClient(
  sourceClient: ClientModel,
  workspaceId: string,
): SagaIterator<ClientModel | null> {
  const clientRequest = transformToRequest(sourceClient, workspaceId);
  const { data } = yield call(fetchObject, `/toggl/api/clients`, {
    method: HttpMethod.Post,
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

function transformToRequest(
  client: ClientModel,
  workspaceId: string,
): TogglClientRequestModel {
  return {
    name: client.name,
    wid: +workspaceId,
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
