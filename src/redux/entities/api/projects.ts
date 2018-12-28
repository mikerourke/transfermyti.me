import {
  ClockifyProject,
  TogglProject,
} from '../../../types/projectsTypes';

export const apiFetchClockifyProjects = (
  workspaceId: string,
): Promise<ClockifyProject[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/projects/`);

export const apiFetchTogglProjects = (
  workspaceId: string,
): Promise<TogglProject[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/projects`);
