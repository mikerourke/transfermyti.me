import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import {
  fetchArray,
  fetchEmpty,
  fetchObject,
} from "~/entityOperations/fetchActions";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { EntityGroup, ToolName, UserGroupModel } from "~/typeDefs";
import { validStringify } from "~/utilities";

interface TogglUserGroupResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

/**
 * Creates new Toggl user groups that correspond to source and returns an array of
 * transformed user groups.
 */
export function* createTogglUserGroupsSaga(
  sourceUserGroups: UserGroupModel[],
): SagaIterator<UserGroupModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceUserGroups,
    apiCreateFunc: createTogglUserGroup,
  });
}

/**
 * Deletes all specified source user groups from Toggl.
 */
export function* deleteTogglUserGroupsSaga(
  sourceUserGroups: UserGroupModel[],
): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceUserGroups,
    apiDeleteFunc: deleteTogglUserGroup,
  });
}

/**
 * Fetches all user groups in Toggl workspaces and returns array of transformed
 * user groups.
 */
export function* fetchTogglUserGroupsSaga(): SagaIterator {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglUserGroupsInWorkspace,
  });
}

/**
 * Creates a new Toggl user group.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/groups.md#create-a-group
 */
function* createTogglUserGroup(
  sourceUserGroup: UserGroupModel,
  targetWorkspaceId: string,
): SagaIterator<UserGroupModel> {
  const userGroupRequest = {
    name: sourceUserGroup.name,
    wid: +targetWorkspaceId,
  };
  const { data } = yield call(fetchObject, "/toggl/api/groups", {
    method: "POST",
    body: userGroupRequest,
  });

  return transformFromResponse(data);
}

/**
 * Deletes the specified Toggl user group.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/groups.md#delete-a-group
 */
function* deleteTogglUserGroup(sourceUserGroup: UserGroupModel): SagaIterator {
  yield call(fetchEmpty, `/toggl/api/groups/${sourceUserGroup.id}`, {
    method: "DELETE",
  });
}

/**
 * Fetches Toggl user groups in the specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-groups
 */
function* fetchTogglUserGroupsInWorkspace(
  workspaceId: string,
): SagaIterator<UserGroupModel[]> {
  const togglUserGroups: TogglUserGroupResponseModel[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/groups`,
  );

  return togglUserGroups.map(transformFromResponse);
}

function transformFromResponse(
  userGroup: TogglUserGroupResponseModel,
): UserGroupModel {
  return {
    id: userGroup.id.toString(),
    name: userGroup.name,
    userIds: [],
    workspaceId: validStringify(userGroup?.wid, ""),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.UserGroups,
  };
}
