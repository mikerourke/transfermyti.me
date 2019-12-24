import { BaseEntityModel } from "~/common/commonTypes";

export interface ClockifyUserGroupModel {
  id: string;
  name: string;
  userIds: string[];
}

export interface TogglUserGroupModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

export interface UserGroupModel extends BaseEntityModel {
  id: string;
  name: string;
  userIds: string[];
}
