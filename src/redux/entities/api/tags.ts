import qs from "qs";
import { API_PAGE_SIZE } from "~/constants";
import { fetchArray, fetchObject } from "./fetchByPayloadType";
import {
  ClockifyTagModel,
  EntityWithName,
  HttpMethod,
  TogglTagModel,
} from "~/types";

export const apiFetchClockifyTags = (
  workspaceId: string,
  page: number,
): Promise<Array<ClockifyTagModel>> => {
  const query = qs.stringify({ page, "page-size": API_PAGE_SIZE });
  return fetchArray(`/clockify/api/v1/workspaces/${workspaceId}/tags?${query}`);
};

export const apiFetchTogglTags = (
  workspaceId: string,
): Promise<Array<TogglTagModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/tags`);

export const apiCreateClockifyTag = (
  workspaceId: string,
  tag: EntityWithName,
): Promise<ClockifyTagModel> =>
  fetchObject(`/clockify/api/v1/workspaces/${workspaceId}/tags`, {
    method: HttpMethod.Post,
    body: tag as unknown,
  });
