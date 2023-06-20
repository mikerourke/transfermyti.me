import { configureStore, type Store } from "@reduxjs/toolkit";
import { clone } from "ramda";
import createSagaMiddleware from "redux-saga";

import { validateCredentials } from "~/redux/credentials/credentials.actions";
import { getCredentialsFromStorage } from "~/redux/credentials/credentials.storage";
import type { ReduxState } from "~/types";
import { isDevelopmentMode, isUseLocalApi } from "~/utilities/environment";

import { rootReducer, initialState } from "./root.reducer";
import { rootSagas } from "./root.sagas";

let currentStore: Store<ReduxState> | null = null;

export function getStore(): Store<ReduxState> {
  if (currentStore === null) {
    createStore();
  }

  return currentStore!;
}

export function createStore(): void {
  let credentials = clone(initialState.credentials);

  const isDevelopment = isDevelopmentMode();

  // Only load the stored credentials from localStorage if in dev mode:
  if (isDevelopment) {
    const storedCredentials = getCredentialsFromStorage();

    if (storedCredentials !== null) {
      credentials = {
        ...credentials,
        ...storedCredentials,
      };
    }
  }

  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
    preloadedState: {
      ...initialState,
      credentials,
    },
    devTools: isDevelopment,
  });

  window.store = store;

  sagaMiddleware.run(rootSagas);

  if (isUseLocalApi()) {
    store.dispatch(validateCredentials.request());
  }

  currentStore = store;
}
