import { applyMiddleware, compose, createStore, type Store } from "redux";
import createSagaMiddleware from "redux-saga";

import { allSagas } from "~/modules/allSagas";
import { validateCredentials } from "~/modules/credentials/credentialsActions";
import { initialState as initialCredentialsState } from "~/modules/credentials/credentialsReducer";
import { getCredentialsFromStorage } from "~/modules/credentials/credentialsStorage";
import { rootReducer, type ReduxState } from "~/redux/rootReducer";
import { isDevelopmentMode, isUseLocalApi } from "~/utilities/environment";

let currentStore: Store<ReduxState> | null = null;

export function getStore(): Store<ReduxState> {
  if (currentStore === null) {
    configureStore();
  }

  return currentStore!;
}

export function configureStore(): void {
  let credentials = initialCredentialsState;
  let composeEnhancers = compose;

  // Only load the stored credentials from localStorage if in dev mode:
  if (isDevelopmentMode()) {
    const storedCredentials = getCredentialsFromStorage();

    if (storedCredentials !== null) {
      credentials = {
        ...initialCredentialsState,
        ...storedCredentials,
      };
    }

    const composeWithDevTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

    if (composeWithDevTools !== undefined) {
      composeEnhancers = composeWithDevTools as unknown as typeof compose;
    }
  }

  const sagaMiddleware = createSagaMiddleware();

  const middleware = [sagaMiddleware];

  const store = createStore(
    rootReducer,
    { credentials } as ReduxState,
    composeEnhancers(applyMiddleware(...middleware)),
  );

  sagaMiddleware.run(allSagas);

  if (isUseLocalApi()) {
    store.dispatch(validateCredentials.request());
  }

  currentStore = store;
}
