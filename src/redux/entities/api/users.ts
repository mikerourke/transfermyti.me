import {
  ClockifyUser,
  TogglMeResponse,
  TogglUser,
} from '../../../types/usersTypes';
import { TogglProjectUser } from '../../../types/projectsTypes';

export const apiFetchClockifyUserDetails = (
  userId: string,
): Promise<ClockifyUser> => fetch(`/clockify/api/users/${userId}`);

export const apiFetchClockifyUsersInProject = (
  projectId: string,
  workspaceId: string,
): Promise<ClockifyUser[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/projects/${projectId}/users/`);

export const apiFetchClockifyUsersInWorkspace = (
  workspaceId: string,
): Promise<ClockifyUser[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/users/`);

export const apiFetchTogglUserDetails = (): Promise<TogglMeResponse> =>
  fetch('/toggl/api/me');

export const apiFetchTogglUsersInProject = (
  projectId: string,
): Promise<TogglProjectUser[]> =>
  fetch(`/toggl/api/projects/${projectId}/project_users`);

export const apiFetchTogglUsersInWorkspace = (
  workspaceId: string,
): Promise<TogglUser[]> => fetch(`/toggl/api/workspaces/${workspaceId}/users`);
