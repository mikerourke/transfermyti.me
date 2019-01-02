import { Dispatch } from 'redux-fixed';
import { ClientModel } from './clientsTypes';
import { ProjectModel } from './projectsTypes';
import { TagModel } from './tagsTypes';
import { TaskModel } from './tasksTypes';
import { TimeEntryModel } from './timeEntriesTypes';
import { UserGroupModel } from './userGroupsTypes';
import { UserModel } from './usersTypes';
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

export interface TogglTotalCurrencyModel {
  currency: string | null;
  amount: number | null;
}

export type EntityModel =
  | ClientModel
  | ProjectModel
  | TagModel
  | TaskModel
  | TimeEntryModel
  | UserGroupModel
  | UserModel;
