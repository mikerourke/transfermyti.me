import { combineReducers } from "redux";
import { appReducer, AppState } from "./app/appReducer";
import {
  credentialsReducer,
  CredentialsState,
} from "./credentials/credentialsReducer";
import { entitiesReducer, EntitiesState } from "./entities/entitiesReducer";

export interface State {
  app: AppState;
  credentials: CredentialsState;
  entities: EntitiesState;
}

export const rootReducer = combineReducers({
  app: appReducer,
  credentials: credentialsReducer,
  entities: entitiesReducer,
});
