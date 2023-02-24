/// <reference types="vitest/globals" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

// Used to avoid the no-explicit-any ESLint rule explicitly. In some cases, it
// is totally OK to just say it's `any`:
declare type AnyValid = any;

declare type Dictionary<T> = Record<string, T>;

declare type RequestBody = Dictionary<
  boolean | number | string | undefined | null | AnyValid[]
>;

declare interface Window {
  store: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__<R>(
    options?: any,
  ): (...args: AnyValid[]) => R;
}

declare type InputChangeEvent = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};

declare type SelectChangeEvent = Event & {
  currentTarget: EventTarget & HTMLSelectElement;
};

declare const __USE_LOCAL_API__: boolean;

declare const __ENV__: "test" | "development";
