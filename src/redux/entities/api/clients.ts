import { ClockifyClient, TogglClient } from '../../../types/clientsTypes';

export const apiFetchClockifyClients = (
  workspaceId: string,
): Promise<ClockifyClient[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/clients/`);

export const apiFetchTogglClients = (
  workspaceId: string,
): Promise<TogglClient[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/clients`);
