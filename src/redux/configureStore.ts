import { createStore, applyMiddleware, compose } from "redux";
import thunkMiddleware from "redux-thunk";
import storage from "store";
import { STORAGE_KEY } from "~/constants";
import { getIfDev } from "~/utils/getIfDev";
import { initialState as initialCredentialsState } from "./credentials/credentialsReducer";
import { rootReducer } from "./rootReducer";
import { ReduxStore } from "~/types";

const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const composeEnhancers: Function = devTools || compose;

export function configureStore(): ReduxStore {
  const middleware = [thunkMiddleware];

  let credentials = initialCredentialsState;

  // Only load the stored credentials from localStorage if in dev mode:
  if (getIfDev()) {
    const storedCredentials = storage.get(STORAGE_KEY);
    if (storedCredentials) {
      credentials = storedCredentials;
    }
  }

  return createStore(
    rootReducer,
    { credentials },
    composeEnhancers(applyMiddleware(...middleware)),
  );
}
