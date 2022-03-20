import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import {
  fetchObject,
  fetchPaginatedFromClockify,
} from "~/entityOperations/fetchActions";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { EntityGroup, ToolName, UserGroupModel } from "~/typeDefs";

interface ClockifyUserGroupResponseModel {
  id: string;
  name: string;
  userIds: string[];
}

/**
 * Creates new Clockify user groups in all target workspaces and returns array of
 * transformed user groups.
 */
export function* createClockifyUserGroupsSaga(
  sourceUserGroups: UserGroupModel[],
): SagaIterator<UserGroupModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceUserGroups,
    apiCreateFunc: createClockifyUserGroup,
  });
}

/**
 * Deletes all specified source user groups from Clockify.
 */
export function* deleteClockifyUserGroupsSaga(
  sourceUserGroups: UserGroupModel[],
): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceUserGroups,
    apiDeleteFunc: deleteClockifyUserGroup,
  });
}

/**
 * Fetches all user groups in Clockify workspaces and returns array of
 * transformed user groups.
 */
export function* fetchClockifyUserGroupsSaga(): SagaIterator<UserGroupModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyUserGroupsInWorkspace,
  });
}

/**
 * Creates a new Clockify user group.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--user-groups--post
 */
function* createClockifyUserGroup(
  sourceUserGroup: UserGroupModel,
  targetWorkspaceId: string,
): SagaIterator {
  const userGroupRequest = { name: sourceUserGroup.name };
  const clockifyUserGroup = yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/user-groups`,
    { method: "POST", body: userGroupRequest },
  );

  return transformFromResponse(clockifyUserGroup, targetWorkspaceId);
}

/**
 * Deletes the specified Clockify user group.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--user-groups--userGroupId--delete
 */
function* deleteClockifyUserGroup(
  sourceUserGroup: UserGroupModel,
): SagaIterator {
  const { workspaceId, id } = sourceUserGroup;
  yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/user-groups/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify user groups in specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspace--workspaceId--usergroups-get
 */
function* fetchClockifyUserGroupsInWorkspace(
  workspaceId: string,
): SagaIterator<UserGroupModel[]> {
  const clockifyUserGroups: ClockifyUserGroupResponseModel[] = yield call(
    fetchPaginatedFromClockify,
    `/clockify/api/workspaces/${workspaceId}/user-groups`,
  );

  return clockifyUserGroups.map((clockifyUserGroup) =>
    transformFromResponse(clockifyUserGroup, workspaceId),
  );
}

function transformFromResponse(
  userGroup: ClockifyUserGroupResponseModel,
  workspaceId: string,
): UserGroupModel {
  return {
    id: userGroup.id,
    name: userGroup.name,
    userIds: userGroup.userIds,
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.UserGroups,
  };
}
