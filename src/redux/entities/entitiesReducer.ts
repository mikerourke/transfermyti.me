import { combineReducers } from 'redux';
import clients, { ClientsState } from './clients/clientsReducer';
import projects, { ProjectsState } from './projects/projectsReducer';
import tags, { TagsState } from './tags/tagsReducer';
import tasks, { TasksState } from './tasks/tasksReducer';
import timeEntries, {
  TimeEntriesState,
} from './timeEntries/timeEntriesReducer';
import userGroups, { UserGroupsState } from './userGroups/userGroupsReducer';
import users, { UsersState } from './users/usersReducer';
import workspaces, { WorkspacesState } from './workspaces/workspacesReducer';

export interface EntitiesState {
  clients: ClientsState;
  projects: ProjectsState;
  tags: TagsState;
  tasks: TasksState;
  timeEntries: TimeEntriesState;
  userGroups: UserGroupsState;
  users: UsersState;
  workspaces: WorkspacesState;
}

export default combineReducers({
  clients,
  projects,
  tags,
  tasks,
  timeEntries,
  userGroups,
  users,
  workspaces,
});
