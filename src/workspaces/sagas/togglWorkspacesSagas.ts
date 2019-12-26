import { call, delay, put } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { TOGGL_API_DELAY } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { incrementCurrentTransferCount } from "~/app/appActions";
import { EntityGroup, HttpMethod } from "~/common/commonTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

export interface TogglWorkspaceResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

interface TogglWorkspaceRequestModel {
  name: string;
}

export function* createTogglWorkspacesSaga(
  sourceWorkspaces: WorkspaceModel[],
): SagaIterator<WorkspaceModel[]> {
  const targetWorkspaces: WorkspaceModel[] = [];

  for (const sourceWorkspace of sourceWorkspaces) {
    yield put(incrementCurrentTransferCount());

    const workspaceRequest = transformToRequest(sourceWorkspace);
    const targetWorkspace = yield call(fetchObject, `/workspaces`, {
      method: HttpMethod.Post,
      body: workspaceRequest,
    });
    targetWorkspaces.push(transformFromResponse(targetWorkspace));

    yield delay(TOGGL_API_DELAY);
  }

  return targetWorkspaces;
}

/**
 * Fetches all workspaces from Toggl and returns transformed result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-workspaces
 */
export function* fetchTogglWorkspacesSaga(): SagaIterator {
  const togglWorkspaces: TogglWorkspaceResponseModel[] = yield call(
    fetchArray,
    "/toggl/api/workspaces",
  );

  return togglWorkspaces.map(transformFromResponse);
}

function transformToRequest(
  workspace: WorkspaceModel,
): TogglWorkspaceRequestModel {
  return {
    name: workspace.name,
  };
}

function transformFromResponse(
  workspace: TogglWorkspaceResponseModel,
): WorkspaceModel {
  return {
    id: workspace.id.toString(),
    name: workspace.name,
    userIds: [],
    isAdmin: true,
    workspaceId: workspace.id.toString(),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Workspaces,
  };
}
