export enum EntityType {
  Workspace = 'workspace',
  Project = 'project',
  Client = 'client',
  Tag = 'tag',
  Task = 'task',
  TimeEntry = 'timeEntry',
  UserGroup = 'userGroup',
  User = 'user',
}

export enum EntityGroup {
  Workspaces = 'workspaces',
  Projects = 'projects',
  Clients = 'clients',
  Tags = 'tags',
  Tasks = 'tasks',
  TimeEntries = 'timeEntries',
  UserGroups = 'userGroups',
  Users = 'users',
}

export interface BaseCompoundEntityModel {
  linkedId: string | null;
  isIncluded: boolean;
  entryCount?: number;
  type?: EntityType;
}
