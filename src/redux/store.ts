import { configureStore, type Store } from "@reduxjs/toolkit";
import { clone } from "ramda";
import createSagaMiddleware from "redux-saga";

import { allSagas } from "~/redux/allSagas";
import { validateCredentials } from "~/redux/credentials/credentialsActions";
import { getCredentialsFromStorage } from "~/redux/credentials/credentialsStorage";
import { rootReducer, initialState } from "~/redux/rootReducer";
import type { ReduxState } from "~/types";
import { isDevelopmentMode, isUseLocalApi } from "~/utilities/environment";

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

  sagaMiddleware.run(allSagas);

  if (isUseLocalApi()) {
    store.dispatch(validateCredentials.request());
  }

  currentStore = store;
}
