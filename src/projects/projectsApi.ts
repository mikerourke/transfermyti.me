import qs from "qs";
import { API_PAGE_SIZE } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { HttpMethod } from "~/common/commonTypes";
import {
  ClockifyProjectModel,
  ClockifyProjectRequestModel,
  TogglProjectModel,
} from "./projectsTypes";

export const apiFetchClockifyProjects = (
  workspaceId: string,
  page: number,
): Promise<ClockifyProjectModel[]> => {
  const query = qs.stringify({ page, "page-size": API_PAGE_SIZE });
  return fetchArray(
    `/clockify/api/v1/workspaces/${workspaceId}/projects?${query}`,
  );
};

export const apiFetchTogglProjects = (
  workspaceId: string,
): Promise<TogglProjectModel[]> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/projects?active=both`);

export const apiCreateClockifyProject = (
  workspaceId: string,
  project: ClockifyProjectRequestModel,
): Promise<ClockifyProjectModel> =>
  fetchObject(`/clockify/api/v1/workspaces/${workspaceId}/projects`, {
    method: HttpMethod.Post,
    body: project as unknown,
  });
