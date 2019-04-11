import { HttpMethod } from '~/types/commonTypes';
import {
  ClockifyProject,
  CreateProjectRequest,
  TogglProject,
} from '~/types/projectsTypes';

export const apiFetchClockifyProjects = (
  workspaceId: string,
): Promise<{ project: Array<ClockifyProject>; count: number }> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/projects/filtered`, {
    method: HttpMethod.Post,
    body: {
      page: 0,
      pageSize: 100,
      search: '',
      clientIds: [],
      userFilterIds: [],
      sortOrder: 'ASCENDING',
      sortColumn: 'name',
    } as any,
  });

export const apiFetchTogglProjects = (
  workspaceId: string,
): Promise<Array<TogglProject>> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/projects?active=both`);

export const apiCreateClockifyProject = (
  workspaceId: string,
  projectRecord: CreateProjectRequest,
): Promise<ClockifyProject> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/projects/`, {
    method: HttpMethod.Post,
    body: projectRecord as any,
  });
