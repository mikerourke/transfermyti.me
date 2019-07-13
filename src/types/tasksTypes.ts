import { BaseCompoundEntityModel } from "~/types/entityTypes";

export interface ClockifyTaskRequestModel {
  assigneeId: string;
  estimate: string;
  id: string;
  name: string;
  status: "ACTIVE" | "DONE";
}

export interface ClockifyTaskModel extends ClockifyTaskRequestModel {
  projectId: string;
}

export interface TogglTaskModel {
  name: string;
  id: number;
  wid: number;
  pid: number;
  uid?: number;
  active: boolean;
  at: string;
  estimated_seconds: number;
}

export interface CompoundTaskModel extends BaseCompoundEntityModel {
  id: string;
  name: string;
  estimate: string;
  projectId: string;
  assigneeId: string | null;
  isActive: boolean;
}
