import qs from "qs";
import { API_PAGE_SIZE } from "~/constants";
import { fetchArray, fetchObject } from "./fetchByPayloadType";
import {
  ClockifyProjectModel,
  ClockifyProjectRequestModel,
  HttpMethod,
  TogglProjectModel,
} from "~/types";

export const apiFetchClockifyProjects = (
  workspaceId: string,
  page: number,
): Promise<Array<ClockifyProjectModel>> => {
  const query = qs.stringify({ page, "page-size": API_PAGE_SIZE });
  return fetchArray(
    `/clockify/api/v1/workspaces/${workspaceId}/projects?${query}`,
  );
};

export const apiFetchTogglProjects = (
  workspaceId: string,
): Promise<Array<TogglProjectModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/projects?active=both`);

export const apiCreateClockifyProject = (
  workspaceId: string,
  project: ClockifyProjectRequestModel,
): Promise<ClockifyProjectModel> =>
  fetchObject(`/clockify/api/v1/workspaces/${workspaceId}/projects`, {
    method: HttpMethod.Post,
    body: project as unknown,
  });
