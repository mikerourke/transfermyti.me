import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import {
  createEntitiesForTool,
  fetchEntitiesForTool,
  fetchObject,
  paginatedClockifyFetch,
} from "~/redux/sagaUtils";
import { EntityGroup, ToolName } from "~/allEntities/allEntitiesTypes";
import { UserGroupModel } from "~/userGroups/userGroupsTypes";

interface ClockifyUserGroupResponseModel {
  id: string;
  name: string;
  userIds: string[];
}

/**
 * Creates new Clockify user groups in all target workspaces and returns array of
 * transformed user groups.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--userGroups--post
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
 * Fetches all user groups in Clockify workspaces and returns array of
 * transformed user groups.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--userGroups-get
 */
export function* fetchClockifyUserGroupsSaga(): SagaIterator<UserGroupModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyUserGroupsInWorkspace,
  });
}

function* createClockifyUserGroup(
  sourceUserGroup: UserGroupModel,
  targetWorkspaceId: string,
): SagaIterator {
  const userGroupRequest = { name: sourceUserGroup.name };
  const clockifyUserGroup = yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/userGroups`,
    { method: "POST", body: userGroupRequest },
  );

  return transformFromResponse(clockifyUserGroup, targetWorkspaceId);
}

function* fetchClockifyUserGroupsInWorkspace(
  workspaceId: string,
): SagaIterator<UserGroupModel[]> {
  const clockifyUserGroups: ClockifyUserGroupResponseModel[] = yield call(
    paginatedClockifyFetch,
    `/clockify/api/workspaces/${workspaceId}/userGroups/`,
  );

  return clockifyUserGroups.map(clockifyUserGroup =>
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
