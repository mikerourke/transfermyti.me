import qs from "qs";
import { API_PAGE_SIZE } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { HttpMethod } from "~/commonTypes";
import { ClockifyTaskModel, TogglTaskModel } from "./tasksTypes";

export const apiFetchClockifyTasks = (
  workspaceId: string,
  projectId: string,
  page: number,
): Promise<Array<ClockifyTaskModel>> => {
  const query = qs.stringify({ page, "page-size": API_PAGE_SIZE });
  return fetchArray(
    `/clockify/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks?${query}`,
  );
};

export const apiFetchTogglTasks = (
  workspaceId: string,
): Promise<Array<TogglTaskModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/tasks?active=both`);

export const apiCreateClockifyTask = (
  workspaceId: string,
  task: ClockifyTaskModel,
): Promise<ClockifyTaskModel> => {
  const { projectId } = task;
  return fetchObject(
    `/clockify/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    {
      method: HttpMethod.Post,
      body: task as unknown,
    },
  );
};
