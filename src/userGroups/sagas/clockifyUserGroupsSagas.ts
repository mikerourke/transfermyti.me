import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { fetchObject } from "~/utils";
import {
  paginatedClockifyFetch,
  createEntitiesForTool,
  fetchEntitiesForTool,
} from "~/redux/sagaUtils";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";
import { UserGroupModel } from "~/userGroups/userGroupsTypes";

interface ClockifyUserGroupResponseModel {
  id: string;
  name: string;
  userIds: string[];
}

interface ClockifyUserGroupRequestModel {
  name: string;
}

/**
 * Creates new Clockify user groups in all target workspaces and returns an array of
 * transformed user groups.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--userGroups--post
 */
export function* createClockifyUserGroupsSaga(
  sourceUserGroups: UserGroupModel[],
): SagaIterator<UserGroupModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceUserGroups,
    creatorFunc: createClockifyUserGroup,
  });
}

/**
 * Fetches all user groups in Clockify workspaces and returns result.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--userGroups-get
 */
export function* fetchClockifyUserGroupsSaga(): SagaIterator<UserGroupModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    fetchFunc: fetchClockifyUserGroupsInWorkspace,
  });
}

function* createClockifyUserGroup(
  sourceUserGroup: UserGroupModel,
  workspaceId: string,
): SagaIterator {
  const userGroupRequest = transformToRequest(sourceUserGroup);
  const targetUserGroup = yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/userGroups`,
    {
      method: HttpMethod.Post,
      body: userGroupRequest,
    },
  );

  return transformFromResponse(targetUserGroup, workspaceId);
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

function transformToRequest(
  userGroup: UserGroupModel,
): ClockifyUserGroupRequestModel {
  return {
    name: userGroup.name,
  };
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
