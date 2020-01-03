/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from "redux";
import { State } from "./rootReducer";

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
