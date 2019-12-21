/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from "redux";
import { State } from "./rootReducer";

export interface ReduxStateEntryForTool<TModel> {
  readonly byId: Record<string, TModel>;
  readonly idValues: string[];
}

/**
 * Redux Types
 */
export type ReduxStore = Store;
export type ReduxState = State;
export type ReduxGetState = () => ReduxState;

interface ReduxThunkDispatch {
  <TResult, TExtra>(asyncAction: ReduxThunkAction<TResult, TExtra>): TResult;
}

interface ReduxStandardDispatch {
  <TAction>(action: TAction & { type: any }): TAction & { type: any };
}

export type ReduxDispatch = ReduxStandardDispatch & ReduxThunkDispatch;
export type ReduxThunkAction<TResult, TExtra = undefined> = (
  dispatch: ReduxDispatch,
  getState: () => ReduxState,
  extraArgument?: TExtra,
) => TResult;

export interface ReduxAction<TPayload = {}> {
  type: string;
  payload?: TPayload;
  error?: boolean;
  meta?: any;
}

/**
 * We need to manually specify the types for RouterState here (instead of
 * importing from the connected-react-router library) so we don't have to
 * include connected-react-router in the main dependencies.
 */
export interface RouterState {
  location: {
    pathname: string;
    search: string;
    hash: string;
    key: string;
    state: any;
  };
  action: "POP" | "PUSH" | "REPLACE";
}
