/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompoundClientModel } from "~/clients/clientsTypes";
import { CompoundProjectModel } from "~/projects/projectsTypes";
import { CompoundTagModel } from "~/tags/tagsTypes";
import { CompoundTaskModel } from "~/tasks/tasksTypes";
import { CompoundTimeEntryModel } from "~/timeEntries/timeEntriesTypes";
import { CompoundUserGroupModel } from "~/userGroups/userGroupsTypes";
import { CompoundUserModel } from "~/users/usersTypes";
import { CompoundWorkspaceModel } from "~/workspaces/workspacesTypes";
import { ReduxStateEntryForTool } from "~/redux/reduxTypes";

export enum ToolName {
  Clockify = "clockify",
  Toggl = "toggl",
}

export interface TogglTotalCurrencyModel {
  currency: string | null;
  amount: number | null;
}

export type CompoundEntityModel =
  | CompoundClientModel
  | CompoundProjectModel
  | CompoundTagModel
  | CompoundTaskModel
  | CompoundTimeEntryModel
  | CompoundUserGroupModel
  | CompoundUserModel;

export enum EntityType {
  Workspace = "workspace",
  Project = "project",
  Client = "client",
  Tag = "tag",
  Task = "task",
  TimeEntry = "timeEntry",
  UserGroup = "userGroup",
  User = "user",
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

export interface BaseCompoundEntityModel {
  workspaceId: string;
  linkedId: string | null;
  isIncluded: boolean;
  entryCount?: number;
  memberOf?: EntityGroup;
}

export type EntityGroupsByKey<TEntity> = Record<string, Array<TEntity>>;

export interface EntitiesByGroupModel {
  [EntityGroup.Clients]: ReduxStateEntryForTool<CompoundClientModel>;
  [EntityGroup.Projects]: ReduxStateEntryForTool<CompoundProjectModel>;
  [EntityGroup.Tags]: ReduxStateEntryForTool<CompoundTagModel>;
  [EntityGroup.Tasks]: ReduxStateEntryForTool<CompoundTaskModel>;
  [EntityGroup.UserGroups]: ReduxStateEntryForTool<CompoundUserGroupModel>;
  [EntityGroup.Users]: ReduxStateEntryForTool<CompoundUserModel>;
  [EntityGroup.Workspaces]: ReduxStateEntryForTool<CompoundWorkspaceModel>;
}

export enum HttpMethod {
  Post = "POST",
  Delete = "DELETE",
}

export interface EntityWithName {
  name: string;
}

export interface EntitiesFetchPayloadModel<TEntity> {
  entityRecords: Array<TEntity>;
  workspaceId: string;
}
