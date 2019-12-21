import { createStore, applyMiddleware, compose, AnyAction } from "redux";
import thunkMiddleware from "redux-thunk";
import storage from "store";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { History } from "history";
import { STORAGE_KEY } from "~/constants";
import { getIfDev } from "~/utils";
import { validateCredentials } from "~/credentials/credentialsActions";
import { initialState as initialCredentialsState } from "~/credentials/credentialsReducer";
import { createRootReducer, RouterReducer } from "./rootReducer";
import { ReduxStore } from "~/redux/reduxTypes";

const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const composeEnhancers: Function = devTools || compose;

export function configureStore(history: History): ReduxStore {
  let credentials = initialCredentialsState;

  // Only load the stored credentials from localStorage if in dev mode:
  if (getIfDev()) {
    const storedCredentials = storage.get(STORAGE_KEY);
    if (storedCredentials) {
      credentials = storedCredentials;
    }
  }

  const routerReducer = connectRouter(history) as RouterReducer;
  const rootReducer = createRootReducer(routerReducer);

  const middleware = [routerMiddleware(history), thunkMiddleware];

  const store = createStore(
    rootReducer,
    { credentials },
    composeEnhancers(applyMiddleware(...middleware)),
  );

  if (process.env.USE_LOCAL_API === "true") {
    store.dispatch(validateCredentials() as AnyAction);
  }

  return store;
}
