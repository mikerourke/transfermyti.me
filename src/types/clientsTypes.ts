import { UniversalEntityModel } from '~/types/entityTypes';

export interface ClockifyClient {
  id: string;
  name: string;
  workspaceId: string;
}

export interface TogglClient {
  id: number;
  wid: number;
  name: string;
  at: string;
}

export type ClientModel = ClockifyClient & UniversalEntityModel;
