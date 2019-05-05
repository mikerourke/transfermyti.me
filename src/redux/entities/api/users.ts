import { fetchArray, fetchObject } from './fetchByPayloadType';
import {
  AddUsersToWorkspaceRequestModel,
  ClockifyUserModel,
  ClockifyWorkspaceModel,
  HttpMethod,
  TogglMeResponseModel,
  TogglProjectUserModel,
  TogglUserModel,
  TogglWorkspaceUserModel,
} from '~/types';

export const apiFetchClockifyMeDetails = (): Promise<ClockifyUserModel> =>
  fetchObject('/clockify/api/v1/user');

export const apiFetchClockifyUserDetails = (
  userId: string,
): Promise<ClockifyUserModel> => fetchObject(`/clockify/api/users/${userId}`);

export const apiFetchTogglMeDetails = (): Promise<TogglMeResponseModel> =>
  fetchObject('/toggl/api/me');

export const apiFetchClockifyUsersInProject = (
  projectId: string,
  workspaceId: string,
): Promise<Array<ClockifyUserModel>> =>
  fetchArray(
    `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/users/`,
  );

export const apiFetchTogglUsersInProject = (
  projectId: string,
): Promise<Array<TogglProjectUserModel>> =>
  fetchArray(`/toggl/api/projects/${projectId}/project_users`);

export const apiFetchClockifyUsersInWorkspace = (
  workspaceId: string,
): Promise<Array<ClockifyUserModel>> =>
  fetchArray(`/clockify/api/workspaces/${workspaceId}/users/`);

export const apiFetchTogglUsersInWorkspace = (
  workspaceId: string,
): Promise<Array<TogglUserModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/users`);

export const apiFetchTogglWorkspaceUsers = (
  workspaceId: string,
): Promise<Array<TogglWorkspaceUserModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/workspace_users`);

export const apiAddClockifyUsersToWorkspace = (
  workspaceId: string,
  requestBody: AddUsersToWorkspaceRequestModel,
): Promise<ClockifyWorkspaceModel> =>
  fetchObject(`/clockify/api/workspaces/${workspaceId}/users/`, {
    method: HttpMethod.Post,
    body: requestBody as any,
  });
