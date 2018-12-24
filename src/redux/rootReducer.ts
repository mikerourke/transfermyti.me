import { combineReducers } from 'redux';
import { Dispatch as FixedDispatch } from 'redux-fixed';
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

export type Dispatch<T> = FixedDispatch<T>;
export type GetState = () => State;

export interface BaseReduxAction {
  type: string;
}

export interface ReduxAction<Payload> extends BaseReduxAction {
  payload?: Payload;
  error?: boolean;
}

export default combineReducers({
  app,
  credentials,
  entities,
});
