import { fetchArray, fetchObject } from "./fetchByPayloadType";
import {
  ClockifyProjectModel,
  CreateProjectRequestModel,
  HttpMethod,
  TogglProjectModel,
} from "~/types";

export const apiFetchClockifyProjects = (
  workspaceId: string,
): Promise<{ project: Array<ClockifyProjectModel>; count: number }> =>
  fetchObject(`/clockify/api/workspaces/${workspaceId}/projects/filtered`, {
    method: HttpMethod.Post,
    body: {
      page: 0,
      pageSize: 100,
      search: "",
      clientIds: [],
      userFilterIds: [],
      sortOrder: "ASCENDING",
      sortColumn: "name",
    } as any,
  });

export const apiFetchTogglProjects = (
  workspaceId: string,
): Promise<Array<TogglProjectModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/projects?active=both`);

export const apiCreateClockifyProject = (
  workspaceId: string,
  project: CreateProjectRequestModel,
): Promise<ClockifyProjectModel> =>
  fetchObject(`/clockify/api/workspaces/${workspaceId}/projects/`, {
    method: HttpMethod.Post,
    body: project as any,
  });
