import { combineReducers } from 'redux';
import user, { UserState } from './user/userReducer';
import workspaces, { WorkspacesState } from './workspaces/workspacesReducer';

export interface EntitiesState {
  user: UserState;
  workspaces: WorkspacesState;
}

export default combineReducers({
  user,
  workspaces,
});
