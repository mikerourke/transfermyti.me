import { Store } from 'redux';
import { State } from '~/redux/rootReducer';
import { CompoundClientModel } from './clientsTypes';
import { EntityGroup } from './entityTypes';
import { CompoundProjectModel } from './projectsTypes';
import { CompoundTagModel } from './tagsTypes';
import { CompoundTaskModel } from './tasksTypes';
import { CompoundTimeEntryModel } from './timeEntriesTypes';
import { CompoundUserGroupModel } from './userGroupsTypes';
import { CompoundUserModel } from './usersTypes';
import { CompoundWorkspaceModel } from '~/types/workspacesTypes';

export enum CheckedState {
  Checked,
  Unchecked,
  Indeterminate,
}

export enum ToolName {
  Clockify = 'clockify',
  Toggl = 'toggl',
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

export interface ReduxStateEntryForTool<TModel> {
  readonly byId: Record<string, TModel>;
  readonly idValues: Array<string>;
}

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
  Post = 'POST',
  Delete = 'DELETE',
}

export interface CreateNamedEntityRequest {
  name: string;
}

/**
 * Redux Types
 */
export type ReduxStore = Store;
export type ReduxState = State;

export type ReduxGetState = () => ReduxState;

export type ThunkAction<TResult, TExtra = undefined> = (
  dispatch: ReduxDispatch,
  getState: () => ReduxState,
  extraArgument?: TExtra,
) => TResult;

export interface ReduxDispatch {
  <TResult, TExtra>(asyncAction: ThunkAction<TResult, TExtra>): TResult;
}
export interface ReduxDispatch {
  <TAction>(action: TAction & { type: any }): TAction & { type: any };
}

export interface ReduxAction<TPayload = {}> {
  type: string;
  payload?: TPayload;
  error?: boolean;
  meta?: any;
}
