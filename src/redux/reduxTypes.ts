/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from "redux";
import { State } from "./rootReducer";

export type ReduxStore = Store;
export type ReduxState = State;
export type ReduxGetState = () => ReduxState;

export interface ReduxDispatch {
  <TAction>(action: TAction & { type: any }): TAction & { type: any };
}

export interface ReduxAction<TPayload = {}> {
  type: string;
  payload?: TPayload;
  error?: boolean;
  meta?: any;
}
