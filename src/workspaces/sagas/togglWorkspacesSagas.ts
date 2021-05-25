import { SagaIterator } from "@redux-saga/types";

import { call } from "redux-saga/effects";

import { fetchArray } from "~/redux/reduxUtils";
import { EntityGroup, WorkspaceModel } from "~/typeDefs";

export interface TogglWorkspaceResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

/**
 * Fetches all workspaces from Toggl and returns array of transformed
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
    isIncluded: false,
    memberOf: EntityGroup.Workspaces,
  };
}
