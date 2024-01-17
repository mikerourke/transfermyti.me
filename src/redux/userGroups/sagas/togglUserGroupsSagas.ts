import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchArray, fetchEmpty, fetchObject } from "~/api/apiRequests";
import { createEntitiesForTool } from "~/api/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/api/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/api/fetchEntitiesForTool";
import { EntityGroup, ToolName, type UserGroup } from "~/types";
import { validStringify } from "~/utilities/textTransforms";

type TogglUserGroupResponse = {
  at: string;
  id: number;
  name: string;
  wid: number;
};

/**
 * Creates new Toggl user groups that correspond to source and returns an array of
 * transformed user groups.
 */
export function* createTogglUserGroupsSaga(
  sourceUserGroups: UserGroup[],
): SagaIterator<UserGroup[]> {
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
  sourceUserGroups: UserGroup[],
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
  sourceUserGroup: UserGroup,
  targetWorkspaceId: string,
): SagaIterator<UserGroup> {
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
function* deleteTogglUserGroup(sourceUserGroup: UserGroup): SagaIterator {
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
): SagaIterator<UserGroup[]> {
  const togglUserGroups: TogglUserGroupResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/groups`,
  );

  return togglUserGroups.map(transformFromResponse);
}

function transformFromResponse(userGroup: TogglUserGroupResponse): UserGroup {
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
