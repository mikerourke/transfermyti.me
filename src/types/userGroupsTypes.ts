import { UniversalEntityModel } from '~/types/entityTypes';

export interface ClockifyUserGroup {
  id: string;
  name: string;
  userIds: string[];
  workspaceId: string;
}

export interface TogglUserGroup {
  id: number;
  wid: number;
  name: string;
  at: string;
}

export type UserGroupModel = ClockifyUserGroup & UniversalEntityModel;
