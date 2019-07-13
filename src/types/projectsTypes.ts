import { ClockifyTaskModel } from "./tasksTypes";
import { ClockifyMembershipModel } from "./usersTypes";
import { BaseCompoundEntityModel } from "~/types/entityTypes";

export enum ClockifyEstimateType {
  Auto = "AUTO",
  Manual = "MANUAL",
}

export interface ClockifyEstimateModel {
  estimate: string;
  type: ClockifyEstimateType;
}

export interface ClockifyProjectModel {
  id: string;
  name: string;
  hourlyRate: string | null;
  clientId: string;
  client: string | null;
  workspaceId: string;
  billable: boolean;
  memberships: Array<ClockifyMembershipModel>;
  color: string;
  estimate: ClockifyEstimateModel;
  archived: boolean;
  tasks: Array<ClockifyTaskModel>;
  public: boolean;
}

export interface TogglProjectModel {
  id: number;
  wid: number;
  cid: number;
  name: string;
  billable: boolean;
  is_private: boolean;
  active: boolean;
  template: boolean;
  at: string;
  created_at: string;
  color: string;
  auto_estimates: boolean;
  actual_hours: number;
  hex_color: string;
}

export interface TogglProjectUserModel {
  id: number;
  pid: number;
  uid: number;
  wid: number;
  manager: boolean;
  rate: number;
}

export interface CompoundProjectModel extends BaseCompoundEntityModel {
  id: string;
  name: string;
  clientId: string;
  isBillable: boolean;
  isPublic: boolean;
  isActive: boolean;
  color: string;
  userIds: Array<string>;
}

export interface CreateProjectRequestModel {
  clientId: string;
  name: string;
  isPublic: boolean;
  isBillable: boolean;
  color: string;
  estimate: {
    estimate: string;
    type: string;
  };
}
