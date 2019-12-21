import { BaseCompoundEntityModel } from "~/common/commonTypes";

export interface ClockifyClientModel {
  id: string;
  name: string;
  workspaceId: string;
}

export interface TogglClientModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

export type CompoundClientModel = ClockifyClientModel & BaseCompoundEntityModel;
