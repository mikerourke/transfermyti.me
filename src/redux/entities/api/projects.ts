import { fetchArray, fetchObject } from "./fetchByPayloadType";
import {
  ClockifyProjectModel,
  ClockifyProjectRequestModel,
  HttpMethod,
  TogglProjectModel,
} from "~/types";

export const apiFetchClockifyProjects = (
  workspaceId: string,
): Promise<Array<ClockifyProjectModel>> =>
  fetchArray(
    `/clockify/api/v1/workspaces/${workspaceId}/projects?page-size=100`,
  );

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
    body: project as any,
  });
