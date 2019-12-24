export enum ToolName {
  None = "none",
  Clockify = "clockify",
  Toggl = "toggl",
}

export enum Mapping {
  Source = "source",
  Target = "target",
}

export interface TransferMappingModel {
  [Mapping.Source]: ToolName;
  [Mapping.Target]: ToolName;
}

export enum EntityGroup {
  Workspaces = "workspaces",
  Projects = "projects",
  Clients = "clients",
  Tags = "tags",
  Tasks = "tasks",
  TimeEntries = "timeEntries",
  UserGroups = "userGroups",
  Users = "users",
}

export interface BaseEntityModel {
  workspaceId: string;
  linkedId: string | null;
  isIncluded: boolean;
  entryCount?: number;
  memberOf?: EntityGroup;
}

export enum HttpMethod {
  Post = "POST",
  Delete = "DELETE",
}

export interface MappedEntityRecordsModel<TEntity> {
  mapping: Mapping;
  recordsById: Record<string, TEntity>;
}
