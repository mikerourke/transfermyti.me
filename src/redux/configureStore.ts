import { connectRouter, routerMiddleware } from "connected-react-router";
import { History } from "history";
import { AnyAction, applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import storage from "store";

import { allEntitiesSaga } from "~/allEntities/allEntitiesSaga";
import { appSaga } from "~/app/appSaga";
import { IS_USING_LOCAL_API, STORAGE_KEY } from "~/constants";
import { validateCredentials } from "~/credentials/credentialsActions";
import { initialState as initialCredentialsState } from "~/credentials/credentialsReducer";
import { credentialsSaga } from "~/credentials/sagas/credentialsSaga";
import { projectMonitoringSaga } from "~/projects/sagas/projectsSagas";
import { taskMonitoringSaga } from "~/tasks/sagas/tasksSagas";
import { getIfDev } from "~/utils";
import { workspacesSaga } from "~/workspaces/sagas/workspacesSaga";

import { analyticsMiddleware } from "./analyticsMiddlewares";
import { ReduxState, ReduxStore } from "./reduxTypes";
import { createRootReducer, RouterReducer } from "./rootReducer";

const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const composeEnhancers: AnyValid = devTools || compose;

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
    analyticsMiddleware,
  ];

  const store = createStore(
    rootReducer,
    // TODO: Figure out why TypeScript is throwing an error.
    // @ts-ignore
    { credentials } as ReduxState,
    composeEnhancers(applyMiddleware(...middleware)),
  );

  sagaMiddleware.run(allEntitiesSaga);
  sagaMiddleware.run(appSaga);
  sagaMiddleware.run(credentialsSaga);
  sagaMiddleware.run(projectMonitoringSaga);
  sagaMiddleware.run(taskMonitoringSaga);
  sagaMiddleware.run(workspacesSaga);

  if (IS_USING_LOCAL_API) {
    store.dispatch(validateCredentials.request() as AnyAction);
  }

  return store;
}
