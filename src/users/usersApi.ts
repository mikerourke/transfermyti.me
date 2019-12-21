import { fetchArray, fetchObject } from "~/utils/fetchByPayloadType";
import { HttpMethod } from "~/common/commonTypes";
import { TogglProjectUserModel } from "~/projects/projectsTypes";
import { ClockifyWorkspaceModel } from "~/workspaces/workspacesTypes";
import {
  AddUsersToWorkspaceRequestModel,
  ClockifyUserModel,
  TogglMeResponseModel,
  TogglUserModel,
  TogglWorkspaceUserModel,
} from "./usersTypes";

export const apiFetchClockifyMeDetails = (): Promise<ClockifyUserModel> =>
  fetchObject("/clockify/api/v1/user");

export const apiFetchTogglMeDetails = (): Promise<TogglMeResponseModel> =>
  fetchObject("/toggl/api/me");

export const apiFetchClockifyUsersInProject = (
  projectId: string,
  workspaceId: string,
): Promise<ClockifyUserModel[]> =>
  fetchArray(
    `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/users/`,
  );

export const apiFetchTogglUsersInProject = (
  projectId: string,
): Promise<TogglProjectUserModel[]> =>
  fetchArray(`/toggl/api/projects/${projectId}/project_users`);

export const apiFetchClockifyUsersInWorkspace = (
  workspaceId: string,
): Promise<ClockifyUserModel[]> =>
  fetchArray(`/clockify/api/workspaces/${workspaceId}/users/`);

export const apiFetchTogglUsersInWorkspace = (
  workspaceId: string,
): Promise<TogglUserModel[]> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/users`);

export const apiFetchTogglWorkspaceUsers = (
  workspaceId: string,
): Promise<TogglWorkspaceUserModel[]> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/workspace_users`);

export const apiAddClockifyUsersToWorkspace = (
  workspaceId: string,
  requestBody: AddUsersToWorkspaceRequestModel,
): Promise<ClockifyWorkspaceModel> =>
  fetchObject(`/clockify/api/workspaces/${workspaceId}/users/`, {
    method: HttpMethod.Post,
    body: requestBody as unknown,
  });
