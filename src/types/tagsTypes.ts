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

export interface TagModel extends ClockifyTag {
  entryCount: number;
  linkedId: string | null;
  isIncluded: boolean;
}
