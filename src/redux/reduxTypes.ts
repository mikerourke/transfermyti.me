import type { Store } from "redux";

export type { ReduxState } from "./rootReducer";

export type ReduxStore = Store;

export interface ReduxDispatch {
  <TAction>(action: TAction & { type: AnyValid }): TAction & { type: AnyValid };
}

export interface ReduxAction<TPayload = Record<string, unknown>> {
  type: string;
  payload?: TPayload;
  error?: boolean;
  meta?: AnyValid;
}
