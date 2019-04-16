import { fetchArray, fetchObject } from './fetchByPayloadType';
import {
  ClockifyUserGroupModel,
  CreateNamedEntityRequest,
  HttpMethod,
  TogglUserGroupModel,
} from '~/types';

export const apiFetchClockifyUserGroups = (
  workspaceId: string,
): Promise<Array<ClockifyUserGroupModel>> =>
  fetchArray(`/clockify/api/workspaces/${workspaceId}/userGroups/`);

export const apiFetchTogglUserGroups = (
  workspaceId: string,
): Promise<Array<TogglUserGroupModel>> =>
  fetchArray(`/toggl/api/workspaces/${workspaceId}/groups`);

export const apiCreateClockifyUserGroup = (
  workspaceId: string,
  userGroupRecord: CreateNamedEntityRequest,
): Promise<ClockifyUserGroupModel> =>
  fetchObject(`/clockify/api/workspaces/${workspaceId}/userGroups/`, {
    method: HttpMethod.Post,
    body: userGroupRecord as any,
  });
