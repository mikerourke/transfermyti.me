import { fetchArray, fetchObject } from "~/utils";
import { EntityWithName, HttpMethod } from "~/common/commonTypes";
import { ClockifyWorkspaceModel, TogglWorkspaceModel } from "./workspacesTypes";

export const apiFetchClockifyWorkspaces = (): Promise<ClockifyWorkspaceModel[]> =>
  fetchArray("/clockify/api/v1/workspaces");

export const apiFetchTogglWorkspaces = (): Promise<TogglWorkspaceModel[]> =>
  fetchArray("/toggl/api/workspaces");

export const apiCreateClockifyWorkspace = (
  workspace: EntityWithName,
): Promise<ClockifyWorkspaceModel> =>
  fetchObject("/clockify/api/v1/workspaces", {
    method: HttpMethod.Post,
    body: workspace as unknown,
  });
