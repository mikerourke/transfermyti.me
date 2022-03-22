import type { Store } from "redux";

import type { State } from "./rootReducer";

export type ReduxStore = Store;
export type ReduxState = State;

export interface ReduxDispatch {
  <TAction>(action: TAction & { type: AnyValid }): TAction & { type: AnyValid };
}

export interface ReduxAction<TPayload = Record<string, unknown>> {
  type: string;
  payload?: TPayload;
  error?: boolean;
  meta?: AnyValid;
}
