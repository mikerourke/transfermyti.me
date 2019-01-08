import { TogglTotalCurrencyModel } from './commonTypes';
import { ClockifyProject } from './projectsTypes';
import { ClockifyUser } from './usersTypes';

export interface ClockifyTimeInterval {
  start: string;
  end: string;
  duration: string;
}

export interface ClockifyTimeEntry {
  id: string;
  description: string;
  tags: string[] | null;
  user: ClockifyUser;
  billable: boolean;
  task: any;
  project: ClockifyProject;
  timeInterval: ClockifyTimeInterval;
  workspaceId: string;
  totalBillable: string | null;
  hourlyRate: string | null;
  isLocked: boolean;
  projectId: string;
}

export interface TogglTimeEntry {
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
  tags: string[];
}

export interface TogglTimeEntriesFetchResponse {
  total_grand: number;
  total_billable: number | null;
  total_currencies: TogglTotalCurrencyModel[];
  total_count: number;
  per_page: number;
  data: TogglTimeEntry[];
}

export interface TimeEntryModel {
  id: string;
  description: string;
  projectId: string;
  taskId: string | null;
  workspaceId: string;
  userId: string | null;
  client: string | null;
  isBillable: boolean;
  start: Date | null;
  end: Date | null;
  tags: string[];
  tagIds?: string[];
  name: null; // Not used, included because other entities have a "name".
  linkedId: string | null;
  isIncluded: boolean;
}

export interface TimeEntryWithClientModel extends TimeEntryModel {
  clientId?: string;
}

export interface DetailedTimeEntryModel extends TimeEntryModel {
  projectName: string | null;
  taskName: string | null;
  userName: string | null;
  tagList: string | null;
}
