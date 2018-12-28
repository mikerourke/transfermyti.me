import { ClockifyUser } from './userTypes';
import { ClockifyProject } from './projectsTypes';

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

export interface TimeEntryModel {
  id: string;
  description: string;
  projectId: string;
  taskId: string | null;
  workspaceId: string;
  userId: string | null;
  client: string | null;
  isBillable: boolean;
  start: Date;
  end: Date;
  tags: string[];
}
