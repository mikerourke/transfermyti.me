import { CreateNamedEntityRequest, HttpMethod } from '~/types/commonTypes';
import { ClockifyUserGroup, TogglUserGroup } from '~/types/userGroupsTypes';

export const apiFetchClockifyUserGroups = (
  workspaceId: string,
): Promise<Array<ClockifyUserGroup>> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/userGroups/`);

export const apiFetchTogglUserGroups = (
  workspaceId: string,
): Promise<Array<TogglUserGroup>> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/groups`);

export const apiCreateClockifyUserGroup = (
  workspaceId: string,
  userGroupRecord: CreateNamedEntityRequest,
): Promise<ClockifyUserGroup> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/userGroups/`, {
    method: HttpMethod.Post,
    body: userGroupRecord as any,
  });
