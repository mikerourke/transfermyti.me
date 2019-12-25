import { call, delay, select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { TOGGL_API_DELAY } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { selectTargetWorkspacesForTransfer } from "~/workspaces/workspacesSelectors";
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

export function* createTogglWorkspacesSaga(): SagaIterator<WorkspaceModel[]> {
  const workspaces: WorkspaceModel[] = yield select(
    selectTargetWorkspacesForTransfer,
  );
  yield call(startGroupTransfer, EntityGroup.Workspaces, workspaces.length);

  const togglWorkspaces: TogglWorkspaceResponseModel[] = [];
  for (const workspace of workspaces) {
    yield call(incrementTransferCounts);

    const workspaceRequest = transformToRequest(workspace);
    const togglWorkspace = yield call(fetchObject, `/workspaces`, {
      method: HttpMethod.Post,
      body: workspaceRequest,
    });
    togglWorkspaces.push(togglWorkspace);

    yield delay(TOGGL_API_DELAY);
  }

  return togglWorkspaces.map(transformFromResponse);
}

/**
 * Fetches all workspaces in Toggl workspace and updates state with result.
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
