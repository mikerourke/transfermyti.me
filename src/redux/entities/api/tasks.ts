import { fetchArray, fetchObject } from "./fetchByPayloadType";
import { ClockifyTaskModel, HttpMethod, TogglTaskModel } from "~/types";

export const apiFetchClockifyTasks = (
  workspaceId: string,
  projectId: string,
): Promise<Array<ClockifyTaskModel>> =>
  fetchArray(
    `/clockify/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks`,
  );

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
      body: task as any,
    },
  );
};
