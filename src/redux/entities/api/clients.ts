import { fetchArray, fetchObject } from "./fetchByPayloadType";
import {
  ClockifyClientModel,
  EntityWithName,
  HttpMethod,
  TogglClientModel,
} from "~/types";

export const apiFetchClockifyClients = (
  workspaceId: string,
): Promise<Array<ClockifyClientModel>> =>
  fetchArray(`/clockify/api/v1/workspaces/${workspaceId}/clients`);

export const apiFetchTogglClients = (
  workspaceId: string,
): Promise<Array<TogglClientModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/clients`);

export const apiCreateClockifyClient = (
  workspaceId: string,
  client: EntityWithName,
): Promise<ClockifyClientModel> =>
  fetchObject(`/clockify/api/v1/workspaces/${workspaceId}/clients`, {
    method: HttpMethod.Post,
    body: client as unknown,
  });
