import { connectRouter, routerMiddleware } from "connected-react-router";
import { History } from "history";
import { AnyAction, applyMiddleware, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";

import { allEntitiesSaga } from "~/modules/allEntities/allEntitiesSaga";
import { appSaga } from "~/modules/app/appSaga";
import { validateCredentials } from "~/modules/credentials/credentialsActions";
import { initialState as initialCredentialsState } from "~/modules/credentials/credentialsReducer";
import { getCredentialsFromStorage } from "~/modules/credentials/credentialsStorage";
import { credentialsSaga } from "~/modules/credentials/sagas/credentialsSaga";
import { projectMonitoringSaga } from "~/modules/projects/sagas/projectsSagas";
import { taskMonitoringSaga } from "~/modules/tasks/sagas/tasksSagas";
import { workspacesSaga } from "~/modules/workspaces/sagas/workspacesSaga";
import { ReduxState, ReduxStore } from "~/redux/reduxTypes";
import { createRootReducer, RouterReducer } from "~/redux/rootReducer";
import { isDevelopmentMode, isUseLocalApi } from "~/utilities/environment";

const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const composeEnhancers: AnyValid = devTools || compose;

export function configureStore(history: History): ReduxStore {
  let credentials = initialCredentialsState;

  // Only load the stored credentials from localStorage if in dev mode:
  if (isDevelopmentMode()) {
    const storedCredentials = getCredentialsFromStorage();

    if (storedCredentials !== null) {
      credentials = {
        ...initialCredentialsState,
        ...storedCredentials,
      };
    }
  }

  const routerReducer = connectRouter(history) as RouterReducer;
  const rootReducer = createRootReducer(routerReducer);
  const sagaMiddleware = createSagaMiddleware();

  const middleware = [sagaMiddleware, routerMiddleware(history)];

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

  if (isUseLocalApi()) {
    store.dispatch(validateCredentials.request() as AnyAction);
  }

  return store;
}
