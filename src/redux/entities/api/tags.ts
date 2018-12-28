import { ClockifyTag, TogglTag } from '../../../types/tagsTypes';

export const apiFetchClockifyTags = (
  workspaceId: string,
): Promise<ClockifyTag[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/tags/`);

export const apiFetchTogglTags = (
  workspaceId: string,
): Promise<TogglTag[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/tags`);
