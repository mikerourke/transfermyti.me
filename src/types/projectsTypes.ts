import { ClockifyTaskModel } from "./tasksTypes";
import { ClockifyHourlyRateModel, ClockifyMembershipModel } from "./usersTypes";
import { BaseCompoundEntityModel } from "~/types/entityTypes";

export interface ClockifyEstimateModel {
  estimate: string;
  type: "AUTO" | "MANUAL";
}

interface ClockifyProjectBaseModel {
  name: string;
  clientId: string;
  estimate: ClockifyEstimateModel;
  color: string;
  billable: boolean;
  hourlyRate: ClockifyHourlyRateModel;
  memberships?: Array<ClockifyMembershipModel>;
  tasks?: Array<ClockifyTaskModel>;
}

export interface ClockifyProjectRequestModel extends ClockifyProjectBaseModel {
  isPublic: boolean;
}

export interface ClockifyProjectModel extends ClockifyProjectBaseModel {
  id: string;
  clientName: string | null;
  workspaceId: string;
  archived: boolean;
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
