import { SagaIterator } from "@redux-saga/types";
import { call } from "redux-saga/effects";
import { fetchObject, paginatedClockifyFetch } from "~/redux/sagaUtils";
import { ClientModel } from "~/clients/clientsTypes";
import { EntityGroup, ToolName } from "~/allEntities/allEntitiesTypes";
import { createEntitiesForTool } from "~/redux/sagaUtils/createEntitiesForTool";
import { fetchEntitiesForTool } from "~/redux/sagaUtils/fetchEntitiesForTool";

interface ClockifyClientResponseModel {
  id: string;
  name: string;
  workspaceId: string;
}

/**
 * Creates new Clockify clients in all target workspaces and returns array of
 * transformed clients.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-post
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
 * Fetches all clients in Clockify workspaces and returns array of transformed
 * clients.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--clients-get
 */
export function* fetchClockifyClientsSaga(): SagaIterator<ClientModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyClientsInWorkspace,
  });
}

function* createClockifyClient(
  sourceClient: ClientModel,
  targetWorkspaceId: string,
): SagaIterator<ClientModel> {
  const clientRequest = { name: sourceClient.name };
  const clockifyClient = yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/clients`,
    { method: "POST", body: clientRequest },
  );

  return transformFromResponse(clockifyClient);
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
