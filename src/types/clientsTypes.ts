import { BaseCompoundEntityModel } from "./entityTypes";

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
