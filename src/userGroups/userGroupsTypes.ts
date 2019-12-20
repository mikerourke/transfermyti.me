import { BaseCompoundEntityModel } from "~/commonTypes";

export interface ClockifyUserGroupModel {
  id: string;
  name: string;
  userIds: Array<string>;
}

export interface TogglUserGroupModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

export type CompoundUserGroupModel = ClockifyUserGroupModel &
  BaseCompoundEntityModel;
