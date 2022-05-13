// Used to avoid the no-explicit-any ESLint rule explicitly. In some cases, it
// is totally OK to just say it's `any`:
declare type AnyValid = any;

declare type Dictionary<T> = Record<string, T>;

declare interface Window {
  store: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__<R>(
    options?: ReduxDevToolsComposeOptions,
  ): (...args: AnyValid[]) => R;
}

declare type InputChangeEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};

declare type SelectChangeEvent = Event & {
  currentTarget: EventTarget & HTMLSelectElement;
};
