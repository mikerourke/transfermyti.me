import { fetchArray, fetchObject } from "~/utils";
import { EntityWithName, HttpMethod } from "~/common/commonTypes";
import { ClockifyUserGroupModel, TogglUserGroupModel } from "./userGroupsTypes";

export const apiFetchClockifyUserGroups = (
  workspaceId: string,
): Promise<ClockifyUserGroupModel[]> =>
  fetchArray(`/clockify/api/workspaces/${workspaceId}/userGroups/`);

export const apiFetchTogglUserGroups = (
  workspaceId: string,
): Promise<TogglUserGroupModel[]> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/groups`);

export const apiCreateClockifyUserGroup = (
  workspaceId: string,
  userGroup: EntityWithName,
): Promise<ClockifyUserGroupModel> =>
  fetchObject(`/clockify/api/workspaces/${workspaceId}/userGroups/`, {
    method: HttpMethod.Post,
    body: userGroup as unknown,
  });
