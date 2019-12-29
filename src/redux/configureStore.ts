import { createStore, applyMiddleware, compose, AnyAction } from "redux";
import createSagaMiddleware from "redux-saga";
import thunkMiddleware from "redux-thunk";
import storage from "store";
import { connectRouter, routerMiddleware } from "connected-react-router";
import { History } from "history";
import { STORAGE_KEY } from "~/constants";
import { getIfDev } from "~/utils";
import { validateCredentials } from "~/credentials/credentialsActions";
import { initialState as initialCredentialsState } from "~/credentials/credentialsReducer";
import { clientsSaga } from "~/clients/sagas/clientsSaga";
import { credentialsSaga } from "~/credentials/sagas/main";
import { projectsSaga } from "~/projects/sagas/projectsSaga";
import { tagsSaga } from "~/tags/sagas/tagsSaga";
import { tasksSaga } from "~/tasks/sagas/tasksSaga";
import { timeEntriesSaga } from "~/timeEntries/sagas/timeEntriesSaga";
import { userGroupsSaga } from "~/userGroups/sagas/userGroupsSaga";
import { usersSaga } from "~/users/sagas/usersSaga";
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

  sagaMiddleware.run(clientsSaga);
  sagaMiddleware.run(credentialsSaga);
  sagaMiddleware.run(projectsSaga);
  sagaMiddleware.run(tagsSaga);
  sagaMiddleware.run(tasksSaga);
  sagaMiddleware.run(timeEntriesSaga);
  sagaMiddleware.run(userGroupsSaga);
  sagaMiddleware.run(usersSaga);
  sagaMiddleware.run(workspacesSaga);

  // @ts-ignore
  if (process.env.USE_LOCAL_API === "true") {
    store.dispatch(validateCredentials.request() as AnyAction);
  }

  return store;
}
