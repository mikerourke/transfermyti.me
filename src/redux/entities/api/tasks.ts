import { HttpMethod } from '~/types/commonTypes';
import { ClockifyTask, CreateTaskRequest, TogglTask } from '~/types/tasksTypes';

export const apiFetchClockifyTasks = (
  workspaceId: string,
  projectId: string,
): Promise<ClockifyTask[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/projects/${projectId}/tasks/`);

export const apiFetchTogglTasks = (workspaceId: string): Promise<TogglTask[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/tasks`);

export const apiCreateClockifyTask = (
  workspaceId: string,
  projectId: string,
  taskRecord: CreateTaskRequest,
): Promise<ClockifyTask> =>
  fetch(
    `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/tasks/`,
    {
      method: HttpMethod.Post,
      body: taskRecord as any,
    },
  );
