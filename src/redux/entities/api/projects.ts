import {
  ClockifyProject,
  TogglProject,
  TogglProjectUser,
} from '../../../types/projectsTypes';
import { ClockifyUser } from '../../../types/userTypes';

export const apiFetchClockifyProjects = (
  workspaceId: string,
): Promise<ClockifyProject[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/projects/`);

export const apiFetchClockifyProjectUsers = (
  workspaceId: string,
  projectId: string,
): Promise<ClockifyUser[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/projects/${projectId}/users/`);

export const apiFetchTogglProjects = (
  workspaceId: string,
): Promise<TogglProject[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/projects`);

export const apiFetchTogglProjectUsers = (
  projectId: string,
): Promise<TogglProjectUser[]> =>
  fetch(`/toggl/api/projects/${projectId}/project_users`);
