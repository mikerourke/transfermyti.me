import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import {
  createEntitiesForTool,
  fetchArray,
  fetchEntitiesForTool,
  fetchObject,
} from "~/redux/sagaUtils";
import { EntityGroup, ToolName } from "~/entities/entitiesTypes";
import { UserGroupModel } from "~/userGroups/userGroupsTypes";

interface TogglUserGroupResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

/**
 * Creates new Toggl user groups that correspond to source and returns an array of
 * transformed user groups.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/groups.md#create-a-group
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
 * Fetches all user groups in Toggl workspaces and returns result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-groups
 */
export function* fetchTogglUserGroupsSaga(): SagaIterator {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglUserGroupsInWorkspace,
  });
}

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
    workspaceId: userGroup.wid.toString(),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.UserGroups,
  };
}
