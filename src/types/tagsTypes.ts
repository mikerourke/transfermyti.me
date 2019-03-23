import { UniversalEntityModel } from '~/types/entityTypes';

export interface ClockifyTag {
  id: string;
  name: string;
  workspaceId: string;
}

export interface TogglTag {
  id: number;
  wid: number;
  name: string;
  at: string;
}

export type TagModel = ClockifyTag & UniversalEntityModel;
