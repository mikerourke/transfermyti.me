import { fetchArray, fetchObject } from './fetchByPayloadType';
import { CreateNamedEntityRequest, HttpMethod } from '~/types/commonTypes';
import {
  ClockifyUserGroupModel,
  TogglUserGroupModel,
} from '~/types/userGroupsTypes';

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
