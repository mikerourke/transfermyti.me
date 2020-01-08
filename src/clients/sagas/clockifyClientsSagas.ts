import { SagaIterator } from "@redux-saga/types";
import { call } from "redux-saga/effects";
import * as reduxUtils from "~/redux/reduxUtils";
import { EntityGroup, ToolName } from "~/allEntities/allEntitiesTypes";
import { ClientModel } from "~/clients/clientsTypes";

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
  return yield call(reduxUtils.createEntitiesForTool, {
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
  yield call(reduxUtils.deleteEntitiesForTool, {
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
  return yield call(reduxUtils.fetchEntitiesForTool, {
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
    reduxUtils.fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/clients`,
    { method: "POST", body: clientRequest },
  );

  return transformFromResponse(clockifyClient);
}

/**
 * Deletes the specified Clockify client.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--clients--clientId--delete
 * @deprecated This is part of the old API and will need to be updated as soon
 *             as the v1 endpoint is available.
 */
function* deleteClockifyClient(sourceClient: ClientModel): SagaIterator {
  const { workspaceId, id } = sourceClient;
  yield call(
    reduxUtils.fetchObject,
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
    reduxUtils.fetchPaginatedFromClockify,
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
