import { Dispatch } from 'redux-fixed';
import { State } from '../redux/rootReducer';

// Use for react-redux connected components:
export type ReduxDispatch = Dispatch<any>;

// Limit amount of imports for connected components:
export type ReduxState = State;

export enum ToolName {
  Clockify = 'clockify',
  Toggl = 'toggl',
}

export enum EntityType {
  Workspace = 'workspace',
  Project = 'project',
  Client = 'client',
  Tag = 'tag',
  Task = 'task',
  TimeEntry = 'timeEntry',
  User = 'user',
  UserGroup = 'userGroup',
}

export enum EntityGroup {
  Workspaces = 'workspaces',
  Projects = 'projects',
  Clients = 'clients',
  Tags = 'tags',
  Tasks = 'tasks',
  TimeEntries = 'timeEntries',
  Users = 'users',
  UserGroups = 'userGroups',
}
