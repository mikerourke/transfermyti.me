import { HttpMethod } from '~/types/commonTypes';
import { ClockifyTag, TogglTag } from '~/types/tagsTypes';

export const apiFetchClockifyTags = (
  workspaceId: string,
): Promise<ClockifyTag[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/tags/`);

export const apiFetchTogglTags = (workspaceId: string): Promise<TogglTag[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/tags`);

export const apiCreateClockifyTag = (
  workspaceId: string,
  tagRecord: { name: string },
): Promise<ClockifyTag> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/tags/`, {
    method: HttpMethod.Post,
    body: tagRecord as any,
  });
