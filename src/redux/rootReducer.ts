import { combineReducers } from 'redux';
import app, { AppState } from './app/appReducer';
import credentials, {
  CredentialsState,
} from './credentials/credentialsReducer';
import entities, { EntitiesState } from './entities/entitiesReducer';

export interface State {
  app: AppState;
  credentials: CredentialsState;
  entities: EntitiesState;
}

export default combineReducers({
  app,
  credentials,
  entities,
});
