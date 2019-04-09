import { Store } from 'redux';
import { State } from '~/redux/rootReducer';
import { ClientModel } from './clientsTypes';
import { ProjectModel } from './projectsTypes';
import { TagModel } from './tagsTypes';
import { TaskModel } from './tasksTypes';
import { TimeEntryModel } from './timeEntriesTypes';
import { UserGroupModel } from './userGroupsTypes';
import { UserModel } from './usersTypes';

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

export type EntityModel =
  | ClientModel
  | ProjectModel
  | TagModel
  | TaskModel
  | TimeEntryModel
  | UserGroupModel
  | UserModel;

export interface ReduxStateEntryForTool<TModel> {
  readonly byId: Record<string, TModel>;
  readonly idValues: Array<string>;
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
  // tslint:disable-next-line:callable-types
  <TResult, TExtra>(asyncAction: ThunkAction<TResult, TExtra>): TResult;
}
export interface ReduxDispatch {
  // tslint:disable-next-line:callable-types
  <TAction>(action: TAction & { type: any }): TAction & { type: any };
}

export interface ReduxAction<TPayload = {}> {
  type: string;
  payload?: TPayload;
  error?: boolean;
  meta?: any;
}
