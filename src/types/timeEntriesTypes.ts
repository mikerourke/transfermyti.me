import { CompoundClientModel } from './clientsTypes';
import { TogglTotalCurrencyModel } from './commonTypes';
import { BaseCompoundEntityModel } from './entityTypes';
import { ClockifyProjectModel, CompoundProjectModel } from './projectsTypes';
import { CompoundTagModel } from './tagsTypes';
import { CompoundTaskModel } from './tasksTypes';
import { ClockifyUserModel, CompoundUserModel } from './usersTypes';
import { CompoundWorkspaceModel } from './workspacesTypes';

export interface ClockifyTimeIntervalModel {
  start: string;
  end: string;
  duration: string;
}

export interface ClockifyTimeEntryModel {
  id: string;
  description: string;
  tags: Array<string> | null;
  user: ClockifyUserModel;
  billable: boolean;
  task: any;
  project: ClockifyProjectModel;
  timeInterval: ClockifyTimeIntervalModel;
  workspaceId: string;
  totalBillable: string | null;
  hourlyRate: string | null;
  isLocked: boolean;
  projectId: string;
}

export interface TogglTimeEntryModel {
  id: number;
  pid: number;
  tid: number | null;
  uid: number;
  description: string;
  start: string;
  end: string;
  updated: string;
  dur: number;
  user: string;
  use_stop: boolean;
  client: string;
  project: string;
  project_color: string;
  project_hex_color: string;
  task: string | null; // Name of task
  billable: number | null;
  is_billable: boolean;
  cur: string | null;
  tags: Array<string>;
}

export interface TogglTimeEntriesFetchResponseModel {
  total_grand: number;
  total_billable: number | null;
  total_currencies: Array<TogglTotalCurrencyModel>;
  total_count: number;
  per_page: number;
  data: Array<TogglTimeEntryModel>;
}

export interface CompoundTimeEntryModel extends BaseCompoundEntityModel {
  id: string;
  description: string;
  projectId: string;
  taskId: string | null;
  workspaceId: string;
  userId: string | null;
  userGroupIds: Array<string> | null;
  clientName: string | null;
  clientId?: string | null;
  isBillable: boolean;
  start: Date | null;
  end: Date | null;
  tagNames: Array<string>;
  isActive: boolean;
  name: null; // Not used, included because other entities have a "name".
}

export interface DetailedTimeEntryModel extends CompoundTimeEntryModel {
  client: CompoundClientModel | null;
  project: CompoundProjectModel | null;
  task: CompoundTaskModel | null;
  tags: Array<CompoundTagModel>;
  user: CompoundUserModel | null;
  workspace: CompoundWorkspaceModel;
}

export interface CreateTimeEntryRequestModel {
  start: string;
  billable: boolean;
  description: string;
  projectId: string;
  taskId: string;
  end: string;
  tagIds: Array<string>;
}

export type TimeEntryForTool = ClockifyTimeEntryModel | TogglTimeEntryModel;
