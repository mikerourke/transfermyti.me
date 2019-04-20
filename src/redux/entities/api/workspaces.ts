import { fetchArray, fetchObject } from './fetchByPayloadType';
import {
  ClockifyWorkspaceModel,
  EntityWithName,
  HttpMethod,
  TogglWorkspaceModel,
} from '~/types';

export const apiFetchClockifyWorkspaces = (): Promise<
  Array<ClockifyWorkspaceModel>
> => fetchArray('/clockify/api/workspaces/');

export const apiFetchTogglWorkspaces = (): Promise<
  Array<TogglWorkspaceModel>
> => fetchArray('/toggl/api/workspaces');

export const apiCreateClockifyWorkspace = (
  workspace: EntityWithName,
): Promise<ClockifyWorkspaceModel> =>
  fetchObject('/clockify/api/workspaces/', {
    method: HttpMethod.Post,
    body: workspace as any,
  });
