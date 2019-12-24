import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { fetchArray } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import { fetchTogglWorkspaces } from "~/workspaces/workspacesActions";
import { EntityGroup, Mapping, ToolName } from "~/common/commonTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

export interface TogglWorkspaceResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

/**
 * Fetches all workspaces in Toggl workspace and updates state with result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-workspaces
 */
export function* fetchTogglWorkspacesSaga(): SagaIterator {
  try {
    const togglWorkspaces: TogglWorkspaceResponseModel[] = yield call(
      fetchArray,
      "/toggl/api/workspaces",
    );

    const recordsById: Record<string, WorkspaceModel> = {};

    for (const togglWorkspace of togglWorkspaces) {
      const workspaceId = togglWorkspace.id.toString();
      recordsById[workspaceId] = transformFromResponse(togglWorkspace);
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Toggl);

    yield put(fetchTogglWorkspaces.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTogglWorkspaces.failure());
  }
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
