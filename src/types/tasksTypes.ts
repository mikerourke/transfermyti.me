export enum ClockifyTaskStatus {
  Active = 'ACTIVE',
  Done = 'DONE',
}

export interface ClockifyTask {
  id: string;
  name: string;
  projectId: string;
  assigneeId: string;
  estimate: string;
  status: ClockifyTaskStatus;
}

export interface TogglTask {
  name: string;
  id: number;
  wid: number;
  pid: number;
  uid?: number;
  active: boolean;
  at: string;
  estimated_seconds: number;
}

export interface TaskModel {
  id: string;
  name: string;
  estimate: string;
  workspaceId: string;
  projectId: string;
  assigneeId: string | null;
  isActive: boolean;
  entryCount: number;
  isIncluded: boolean;
}
