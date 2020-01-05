import { SagaIterator } from "@redux-saga/types";
import { call, delay, put } from "redux-saga/effects";
import { TOGGL_API_DELAY } from "~/constants";
import { fetchArray, fetchObject } from "~/redux/reduxUtils";
import { incrementEntityGroupTransferCompletedCount } from "~/allEntities/allEntitiesActions";
import { EntityGroup } from "~/allEntities/allEntitiesTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

export interface TogglWorkspaceResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

/**
 * Creates Toggl workspaces for transfer and returns array of transformed
 * workspaces.
 * @todo Validate endpoint (creating a Toggl workspace is not documented).
 */
export function* createTogglWorkspacesSaga(
  sourceWorkspaces: WorkspaceModel[],
): SagaIterator<WorkspaceModel[]> {
  const targetWorkspaces: WorkspaceModel[] = [];

  for (const sourceWorkspace of sourceWorkspaces) {
    const workspaceRequest = { name: sourceWorkspace.name };
    const targetWorkspace = yield call(fetchObject, "/workspaces", {
      method: "POST",
      body: workspaceRequest,
    });
    targetWorkspaces.push(transformFromResponse(targetWorkspace));

    yield put(
      incrementEntityGroupTransferCompletedCount(EntityGroup.Workspaces),
    );

    yield delay(TOGGL_API_DELAY);
  }

  return targetWorkspaces;
}

/**
 * Fetches all workspaces from Toggl and returns transformed array of transformed
 * workspaces.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-workspaces
 */
export function* fetchTogglWorkspacesSaga(): SagaIterator {
  const togglWorkspaces: TogglWorkspaceResponseModel[] = yield call(
    fetchArray,
    "/toggl/api/workspaces",
  );

  return togglWorkspaces.map(transformFromResponse);
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
