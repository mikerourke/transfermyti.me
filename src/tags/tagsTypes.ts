import { BaseCompoundEntityModel } from "~/common/commonTypes";

export interface ClockifyTagModel {
  id: string;
  name: string;
  workspaceId: string;
}

export interface TogglTagModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

export type CompoundTagModel = ClockifyTagModel & BaseCompoundEntityModel;