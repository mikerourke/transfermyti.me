import { createStore, applyMiddleware, compose, AnyAction } from "redux";
import createSagaMiddleware from "redux-saga";
import thunkMiddleware from "redux-thunk";
import storage from "store";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { History } from "history";
import { STORAGE_KEY } from "~/constants";
import { getIfDev } from "~/utils";
import { allEntitiesSaga } from "~/allEntities/allEntitiesSaga";
import { validateCredentials } from "~/credentials/credentialsActions";
import { initialState as initialCredentialsState } from "~/credentials/credentialsReducer";
import { credentialsSaga } from "~/credentials/sagas/credentialsSaga";
import { workspacesSaga } from "~/workspaces/sagas/workspacesSaga";
import { createRootReducer, RouterReducer } from "./rootReducer";
import { ReduxStore, ReduxState } from "~/redux/reduxTypes";

const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const composeEnhancers: Function = devTools || compose;

export function configureStore(history: History): ReduxStore {
  let credentials = initialCredentialsState;

  // Only load the stored credentials from localStorage if in dev mode:
  if (getIfDev()) {
    const storedCredentials = storage.get(STORAGE_KEY);
    if (storedCredentials) {
      credentials = {
        ...initialCredentialsState,
        ...storedCredentials,
      };
    }
  }

  const routerReducer = connectRouter(history) as RouterReducer;
  const rootReducer = createRootReducer(routerReducer);
  const sagaMiddleware = createSagaMiddleware();

  const middleware = [
    sagaMiddleware,
    routerMiddleware(history),
    thunkMiddleware,
  ];

  const store = createStore(
    rootReducer,
    { credentials } as ReduxState,
    composeEnhancers(applyMiddleware(...middleware)),
  );

  sagaMiddleware.run(allEntitiesSaga);
  sagaMiddleware.run(credentialsSaga);
  sagaMiddleware.run(workspacesSaga);

  // @ts-ignore
  if (process.env.USE_LOCAL_API === "true") {
    store.dispatch(validateCredentials.request() as AnyAction);
  }

  return store;
}
