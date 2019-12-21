import qs from "qs";
import { API_PAGE_SIZE } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { EntityWithName, HttpMethod } from "~/common/commonTypes";
import { ClockifyTagModel, TogglTagModel } from "./tagsTypes";

export const apiFetchClockifyTags = (
  workspaceId: string,
  page: number,
): Promise<ClockifyTagModel[]> => {
  const query = qs.stringify({ page, "page-size": API_PAGE_SIZE });
  return fetchArray(`/clockify/api/v1/workspaces/${workspaceId}/tags?${query}`);
};

export const apiFetchTogglTags = (
  workspaceId: string,
): Promise<TogglTagModel[]> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/tags`);

export const apiCreateClockifyTag = (
  workspaceId: string,
  tag: EntityWithName,
): Promise<ClockifyTagModel> =>
  fetchObject(`/clockify/api/v1/workspaces/${workspaceId}/tags`, {
    method: HttpMethod.Post,
    body: tag as unknown,
  });
