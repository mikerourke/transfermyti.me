import {
  ClockifyUserGroup,
  TogglUserGroup,
} from '../../../types/userGroupsTypes';
import {
  CreateNamedEntityRequest,
  HttpMethod
} from '../../../types/commonTypes';

export const apiFetchClockifyUserGroups = (
  workspaceId: string,
): Promise<ClockifyUserGroup[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/userGroups/`);

export const apiFetchTogglUserGroups = (
  workspaceId: string,
): Promise<TogglUserGroup[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/groups`);

export const apiCreateClockifyUserGroup = (
  workspaceId: string,
  userGroupRecord: CreateNamedEntityRequest,
): Promise<ClockifyUserGroup> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/userGroups/`, {
    method: HttpMethod.Post,
    body: userGroupRecord as any,
  });
