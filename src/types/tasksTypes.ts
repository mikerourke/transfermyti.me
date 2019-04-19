import { BaseCompoundEntityModel } from '~/types/entityTypes';

export enum ClockifyTaskStatus {
  Active = 'ACTIVE',
  Done = 'DONE',
}

export interface ClockifyTaskModel {
  id: string;
  name: string;
  projectId: string;
  assigneeId: string;
  estimate: string;
  status: ClockifyTaskStatus;
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

export interface CreateTaskRequestModel {
  name: string;
  projectId: string;
  estimate?: string;
  assigneeId?: string;
}
