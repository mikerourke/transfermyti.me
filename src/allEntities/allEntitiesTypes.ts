export enum ToolName {
  None = "none",
  Clockify = "clockify",
  Toggl = "toggl",
}

export enum Mapping {
  Source = "source",
  Target = "target",
}

export enum ToolAction {
  None = "none",
  Delete = "delete",
  Transfer = "transfer",
}

export interface ToolHelpDetailsModel {
  toolName: ToolName;
  displayName: string;
  toolLink: string;
}

export enum EntityGroup {
  Clients = "clients",
  Projects = "projects",
  Tags = "tags",
  Tasks = "tasks",
  TimeEntries = "timeEntries",
  UserGroups = "userGroups",
  Users = "users",
  Workspaces = "workspaces",
}

export enum FetchStatus {
  Pending = "PENDING",
  InProcess = "IN_PROCESS",
  Success = "SUCCESS",
  Error = "ERROR",
}

export interface BaseEntityModel {
  id: string;
  workspaceId: string;
  linkedId: string | null;
  isIncluded: boolean;
  entryCount: number;
  memberOf?: EntityGroup;
}

export type TableViewModel<TEntity> = TEntity & {
  existsInTarget: boolean;
  isActiveInSource: boolean;
  isActiveInTarget: boolean;
};

export type CountsByEntityGroupModel = Record<EntityGroup, number>;

export interface ToolNameByMappingModel {
  [Mapping.Source]: ToolName;
  [Mapping.Target]: ToolName;
}
