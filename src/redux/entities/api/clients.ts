import { ClockifyClient, TogglClient } from '~/types/clientsTypes';
import { CreateNamedEntityRequest, HttpMethod } from '~/types/commonTypes';

export const apiFetchClockifyClients = (
  workspaceId: string,
): Promise<Array<ClockifyClient>> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/clients/`);

export const apiFetchTogglClients = (
  workspaceId: string,
): Promise<Array<TogglClient>> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/clients`);

export const apiCreateClockifyClient = (
  workspaceId: string,
  clientRecord: CreateNamedEntityRequest,
): Promise<ClockifyClient> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/clients/`, {
    method: HttpMethod.Post,
    body: clientRecord as any,
  });
