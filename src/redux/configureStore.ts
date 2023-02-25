import { configureStore, type Store } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { allSagas } from "~/modules/allSagas";
import { validateCredentials } from "~/modules/credentials/credentialsActions";
import { getCredentialsFromStorage } from "~/modules/credentials/credentialsStorage";
import { rootReducer, initialState } from "~/redux/rootReducer";
import type { ReduxState } from "~/typeDefs";
import { isDevelopmentMode, isUseLocalApi } from "~/utilities/environment";

let currentStore: Store<ReduxState> | null = null;

export function getStore(): Store<ReduxState> {
  if (currentStore === null) {
    createStore();
  }

  return currentStore!;
}

export function createStore(): void {
  let credentials = initialState.credentials;

  const isDevelopment = isDevelopmentMode();

  // Only load the stored credentials from localStorage if in dev mode:
  if (isDevelopment) {
    const storedCredentials = getCredentialsFromStorage();

    if (storedCredentials !== null) {
      credentials = {
        ...initialState.credentials,
        ...storedCredentials,
      };
    }
  }

  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sagaMiddleware),
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
