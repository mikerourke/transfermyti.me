import { ClockifyTask, TogglTask } from '../../../types/tasksTypes';

export const apiFetchClockifyTasks = (
  workspaceId: string,
): Promise<ClockifyTask[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/tasks/`);

export const apiFetchTogglTasks = (workspaceId: string): Promise<TogglTask[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/tasks`);
