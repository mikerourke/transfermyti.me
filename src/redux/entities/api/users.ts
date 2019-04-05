import { HttpMethod } from '~/types/commonTypes';
import { TogglProjectUser } from '~/types/projectsTypes';
import {
  AddUsersToWorkspaceRequest,
  ClockifyUser,
  TogglMeResponse,
  TogglUser,
  TogglWorkspaceUser,
} from '~/types/usersTypes';
import { ClockifyWorkspace } from '~/types/workspacesTypes';

export const apiFetchClockifyUserDetails = (
  userId: string,
): Promise<ClockifyUser> => fetch(`/clockify/api/users/${userId}`);

export const apiFetchTogglMeDetails = (): Promise<TogglMeResponse> =>
  fetch('/toggl/api/me');

export const apiFetchClockifyUsersInProject = (
  projectId: string,
  workspaceId: string,
): Promise<ClockifyUser[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/projects/${projectId}/users/`);

export const apiFetchTogglUsersInProject = (
  projectId: string,
): Promise<TogglProjectUser[]> =>
  fetch(`/toggl/api/projects/${projectId}/project_users`);

export const apiFetchClockifyUsersInWorkspace = (
  workspaceId: string,
): Promise<ClockifyUser[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/users/`);

export const apiFetchTogglUsersInWorkspace = (
  workspaceId: string,
): Promise<TogglUser[]> => fetch(`/toggl/api/workspaces/${workspaceId}/users`);

export const apiFetchTogglWorkspaceUsers = (
  workspaceId: string,
): Promise<TogglWorkspaceUser[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/workspace_users`);

export const apiAddClockifyUsersToWorkspace = (
  workspaceId: string,
  requestBody: AddUsersToWorkspaceRequest,
): Promise<ClockifyWorkspace> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/users/`, {
    method: HttpMethod.Post,
    body: requestBody as any,
  });
