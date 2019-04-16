import { fetchArray, fetchObject } from './fetchByPayloadType';
import {
  ClockifyClientModel,
  CreateNamedEntityRequest,
  HttpMethod,
  TogglClientModel,
} from '~/types';

export const apiFetchClockifyClients = (
  workspaceId: string,
): Promise<Array<ClockifyClientModel>> =>
  fetchArray(`/clockify/api/workspaces/${workspaceId}/clients/`);

export const apiFetchTogglClients = (
  workspaceId: string,
): Promise<Array<TogglClientModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/clients`);

export const apiCreateClockifyClient = (
  workspaceId: string,
  clientRecord: CreateNamedEntityRequest,
): Promise<ClockifyClientModel> =>
  fetchObject(`/clockify/api/workspaces/${workspaceId}/clients/`, {
    method: HttpMethod.Post,
    body: clientRecord as any,
  });
