export interface ClockifyUserGroup {
  id: string;
  name: string;
  userIds: string[];
  workspaceId: string;
}

export interface TogglUserGroup {
  id: number;
  wid: number;
  name: string;
  at: string;
}

export interface UserGroupModel extends ClockifyUserGroup {
  entryCount: number;
  linkedId: string | null;
  isIncluded: boolean;
}
