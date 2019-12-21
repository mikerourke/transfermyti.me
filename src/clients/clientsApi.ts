import qs from "qs";
import { API_PAGE_SIZE } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { EntityWithName, HttpMethod } from "~/common/commonTypes";
import { ClockifyClientModel, TogglClientModel } from "./clientsTypes";

export const apiFetchClockifyClients = (
  workspaceId: string,
  page: number,
): Promise<ClockifyClientModel[]> => {
  const query = qs.stringify({ page, "page-size": API_PAGE_SIZE });
  return fetchArray(
    `/clockify/api/v1/workspaces/${workspaceId}/clients?${query}`,
  );
};

export const apiFetchTogglClients = (
  workspaceId: string,
): Promise<TogglClientModel[]> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/clients`);

export const apiCreateClockifyClient = (
  workspaceId: string,
  client: EntityWithName,
): Promise<ClockifyClientModel> =>
  fetchObject(`/clockify/api/v1/workspaces/${workspaceId}/clients`, {
    method: HttpMethod.Post,
    body: client as unknown,
  });
