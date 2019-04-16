import { fetchArray, fetchObject } from './fetchByPayloadType';
import {
  ClockifyTaskModel,
  CreateTaskRequestModel,
  HttpMethod,
  TogglTaskModel,
} from '~/types';

export const apiFetchClockifyTasks = (
  workspaceId: string,
  projectId: string,
): Promise<Array<ClockifyTaskModel>> =>
  fetchArray(
    `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/tasks/`,
  );

export const apiFetchTogglTasks = (
  workspaceId: string,
): Promise<Array<TogglTaskModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/tasks?active=both`);

export const apiCreateClockifyTask = (
  workspaceId: string,
  projectId: string,
  taskRecord: CreateTaskRequestModel,
): Promise<ClockifyTaskModel> =>
  fetchObject(
    `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/tasks/`,
    {
      method: HttpMethod.Post,
      body: taskRecord as any,
    },
  );
