import { fetchArray, fetchObject } from './fetchByPayloadType';
import { HttpMethod } from '~/types/commonTypes';
import { ClockifyTagModel, TogglTagModel } from '~/types/tagsTypes';

export const apiFetchClockifyTags = (
  workspaceId: string,
): Promise<Array<ClockifyTagModel>> =>
  fetchArray(`/clockify/api/workspaces/${workspaceId}/tags/`);

export const apiFetchTogglTags = (
  workspaceId: string,
): Promise<Array<TogglTagModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/tags`);

export const apiCreateClockifyTag = (
  workspaceId: string,
  tagRecord: { name: string },
): Promise<ClockifyTagModel> =>
  fetchObject(`/clockify/api/workspaces/${workspaceId}/tags/`, {
    method: HttpMethod.Post,
    body: tagRecord as any,
  });
