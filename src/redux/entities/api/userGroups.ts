import {
  ClockifyUserGroup,
  TogglUserGroup,
} from '../../../types/userGroupsTypes';

export const apiFetchClockifyUserGroups = (
  workspaceId: string,
): Promise<ClockifyUserGroup[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/userGroups/`);

export const apiFetchTogglUserGroups = (
  workspaceId: string,
): Promise<TogglUserGroup[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/groups`);
