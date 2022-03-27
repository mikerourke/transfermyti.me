export type { ReduxState } from "~/redux/rootReducer";

type NotificationType = "error" | "info" | "success";

export interface NotificationModel {
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

export type ValidEntity<TEntity> = TEntity & BaseEntityModel;

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

export interface ClientModel extends BaseEntityModel {
  id: string;
  name: string;
  workspaceId: string;
}

export type ClientsByIdModel = Record<string, ClientModel>;

export type ClientTableViewModel = TableViewModel<ClientModel> & {
  projectCount: number;
};

export interface CredentialsModel {
  apiKey: string | null;
  email: string | null;
  userId: string | null;
}

export type CredentialsByMappingModel = Record<Mapping, CredentialsModel>;

export type ValidationErrorsByMappingModel = Record<Mapping, string | null>;

export interface PartialCredentialsUpdateModel {
  mapping: Mapping;
  apiKey?: string | null;
  email?: string | null;
  userId?: string | null;
}

export interface EstimateModel {
  estimate: number;
  type: "AUTO" | "MANUAL";
}

export interface ProjectModel extends BaseEntityModel {
  id: string;
  name: string;
  clientId: string | null;
  isBillable: boolean;
  isPublic: boolean;
  isActive: boolean;
  estimate: EstimateModel;
  color: string;
  userIds: string[];
}

export type ProjectsByIdModel = Record<string, ProjectModel>;

export interface TagModel extends BaseEntityModel {
  id: string;
  name: string;
  workspaceId: string;
}

export type TagsByIdModel = Record<string, TagModel>;

export interface TaskModel extends BaseEntityModel {
  id: string;
  name: string;
  estimate: string;
  projectId: string;
  assigneeIds: string[];
  isActive: boolean;
}

export type TasksByIdModel = Record<string, TaskModel>;

export type TaskTableViewModel = TableViewModel<TaskModel> & {
  projectName: string;
};

export interface TimeEntryModel extends BaseEntityModel {
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

export type TimeEntriesByIdModel = Record<string, TimeEntryModel>;

export interface TimeEntryTableViewModel
  extends TableViewModel<TimeEntryModel> {
  taskName: string | null;
  projectName: string | null;
}

export interface UserGroupModel extends BaseEntityModel {
  id: string;
  name: string;
  userIds: string[];
}

export type UserGroupsByIdModel = Record<string, UserGroupModel>;

export interface UserModel extends BaseEntityModel {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean | null;
  isActive: boolean;
  userGroupIds: string[] | null;
}

export type UsersByIdModel = Record<string, UserModel>;

export interface WorkspaceModel extends BaseEntityModel {
  id: string;
  name: string;
  userIds: string[];
  isAdmin: boolean | null;
}

export type WorkspacesByIdModel = Record<string, WorkspaceModel>;
