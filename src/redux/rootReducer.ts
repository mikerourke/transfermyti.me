import { combineReducers } from "redux";

import {
  allEntitiesReducer,
  type AllEntitiesState,
} from "~/modules/allEntities/allEntitiesReducer";
import { appReducer, type AppState } from "~/modules/app/appReducer";
import {
  clientsReducer,
  type ClientsState,
} from "~/modules/clients/clientsReducer";
import {
  credentialsReducer,
  type CredentialsState,
} from "~/modules/credentials/credentialsReducer";
import {
  projectsReducer,
  type ProjectsState,
} from "~/modules/projects/projectsReducer";
import { tagsReducer, type TagsState } from "~/modules/tags/tagsReducer";
import { tasksReducer, type TasksState } from "~/modules/tasks/tasksReducer";
import {
  timeEntriesReducer,
  type TimeEntriesState,
} from "~/modules/timeEntries/timeEntriesReducer";
import {
  userGroupsReducer,
  type UserGroupsState,
} from "~/modules/userGroups/userGroupsReducer";
import { usersReducer, type UsersState } from "~/modules/users/usersReducer";
import {
  workspacesReducer,
  type WorkspacesState,
} from "~/modules/workspaces/workspacesReducer";

export interface ReduxState {
  allEntities: AllEntitiesState;
  app: AppState;
  clients: ClientsState;
  credentials: CredentialsState;
  projects: ProjectsState;
  tags: TagsState;
  tasks: TasksState;
  timeEntries: TimeEntriesState;
  userGroups: UserGroupsState;
  users: UsersState;
  workspaces: WorkspacesState;
}

export const rootReducer = combineReducers({
  allEntities: allEntitiesReducer,
  app: appReducer,
  clients: clientsReducer,
  credentials: credentialsReducer,
  projects: projectsReducer,
  tags: tagsReducer,
  tasks: tasksReducer,
  timeEntries: timeEntriesReducer,
  userGroups: userGroupsReducer,
  users: usersReducer,
  workspaces: workspacesReducer,
});
