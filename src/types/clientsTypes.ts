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

export interface ClientModel extends ClockifyClient {
  entryCount: number;
  isIncluded: boolean;
}
