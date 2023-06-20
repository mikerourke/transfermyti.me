import type { AllEntitiesState } from "~/redux/allEntities/allEntitiesReducer";
import type { AppState } from "~/redux/app/appReducer";
import type { ClientsState } from "~/redux/clients/clientsReducer";
import type { CredentialsState } from "~/redux/credentials/credentialsReducer";
import type { ProjectsState } from "~/redux/projects/projectsReducer";
import type { TagsState } from "~/redux/tags/tagsReducer";
import type { TasksState } from "~/redux/tasks/tasksReducer";
import type { TimeEntriesState } from "~/redux/timeEntries/timeEntriesReducer";
import type { UserGroupsState } from "~/redux/userGroups/userGroupsReducer";
import type { UsersState } from "~/redux/users/usersReducer";
import type { WorkspacesState } from "~/redux/workspaces/workspacesReducer";

export interface ReduxState {
  allEntities: AllEntitiesState;
  app: AppState;
  clients: ClientsState;
  credentials: CredentialsState;
  projects: ProjectsState;
  tags: TagsState;
  tasks: TasksState;
  timeEntries: TimeEntriesState;
  userGroups: UserGroupsState;
  users: UsersState;
  workspaces: WorkspacesState;
}

type NotificationType = "error" | "info" | "success";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

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

export interface ToolHelpDetails {
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

export interface AnyEntity {
  id: string;
  workspaceId: string;
  linkedId: string | null;
  isIncluded: boolean;
  entryCount: number;
  memberOf?: EntityGroup;
}

export type ValidEntity<TEntity> = TEntity & AnyEntity;

export type EntityTableRecord<TEntity> = TEntity & {
  existsInTarget: boolean;
  isActiveInSource: boolean;
  isActiveInTarget: boolean;
};

export type CountsByEntityGroup = Record<
  Exclude<EntityGroup, EntityGroup.Workspaces>,
  number
>;

export interface ToolNameByMapping {
  [Mapping.Source]: ToolName;
  [Mapping.Target]: ToolName;
}

export interface Client extends AnyEntity {
  id: string;
  name: string;
  workspaceId: string;
}

export type ClientTableRecord = EntityTableRecord<Client> & {
  projectCount: number;
};

export interface Credentials {
  apiKey: string | null;
  email: string | null;
  userId: string | null;
}

export type CredentialsByMapping = Record<Mapping, Credentials>;

export type ValidationErrorsByMapping = Record<Mapping, string | null>;

export interface PartialCredentialsUpdate {
  mapping: Mapping;
  apiKey?: string | null;
  email?: string | null;
  userId?: string | null;
}

export interface Estimate {
  estimate: number | string;
  type: "AUTO" | "MANUAL";
}

export interface Project extends AnyEntity {
  id: string;
  name: string;
  clientId: string | null;
  isBillable: boolean;
  isPublic: boolean;
  isActive: boolean;
  estimate: Estimate;
  color: string;
  userIds: string[];
}

export interface Tag extends AnyEntity {
  id: string;
  name: string;
  workspaceId: string;
}

export interface Task extends AnyEntity {
  id: string;
  name: string;
  estimate: string;
  projectId: string;
  assigneeIds: string[];
  isActive: boolean;
}

export type TaskTableRecord = EntityTableRecord<Task> & {
  projectName: string;
};

export interface TimeEntry extends AnyEntity {
  id: string;
  description: string;
  isBillable: boolean;
  start: Date;
  end: Date;
  year: number;
  isActive: boolean;
  clientId: string | null;
  projectId: string | null;
  tagIds: string[];
  tagNames: string[];
  taskId: string | null;
  userId: string | null;
  userGroupIds: string[];
}

export interface TimeEntryTableRecord extends EntityTableRecord<TimeEntry> {
  taskName: string | null;
  projectName: string | null;
}

export interface UserGroup extends AnyEntity {
  id: string;
  name: string;
  userIds: string[];
}

export interface User extends AnyEntity {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean | null;
  isActive: boolean;
  userGroupIds: string[] | null;
}

export interface Workspace extends AnyEntity {
  id: string;
  name: string;
  userIds: string[];
  isAdmin: boolean | null;
}
