import { RouterState } from "connected-react-router";
import { combineReducers, Reducer } from "redux";

import {
  allEntitiesReducer,
  AllEntitiesState,
} from "~/modules/allEntities/allEntitiesReducer";
import { appReducer, AppState } from "~/modules/app/appReducer";
import { clientsReducer, ClientsState } from "~/modules/clients/clientsReducer";
import {
  credentialsReducer,
  CredentialsState,
} from "~/modules/credentials/credentialsReducer";
import {
  projectsReducer,
  ProjectsState,
} from "~/modules/projects/projectsReducer";
import { tagsReducer, TagsState } from "~/modules/tags/tagsReducer";
import { tasksReducer, TasksState } from "~/modules/tasks/tasksReducer";
import {
  timeEntriesReducer,
  TimeEntriesState,
} from "~/modules/timeEntries/timeEntriesReducer";
import {
  userGroupsReducer,
  UserGroupsState,
} from "~/modules/userGroups/userGroupsReducer";
import { usersReducer, UsersState } from "~/modules/users/usersReducer";
import {
  workspacesReducer,
  WorkspacesState,
} from "~/modules/workspaces/workspacesReducer";

export type RouterReducer = Reducer<RouterState>;

export interface State {
  allEntities: AllEntitiesState;
  app: AppState;
  clients: ClientsState;
  credentials: CredentialsState;
  projects: ProjectsState;
  router: RouterState;
  tags: TagsState;
  tasks: TasksState;
  timeEntries: TimeEntriesState;
  userGroups: UserGroupsState;
  users: UsersState;
  workspaces: WorkspacesState;
}

export const createRootReducer = (router: RouterReducer): Reducer<State> =>
  combineReducers({
    allEntities: allEntitiesReducer,
    app: appReducer,
    clients: clientsReducer,
    credentials: credentialsReducer,
    projects: projectsReducer,
    router,
    tags: tagsReducer,
    tasks: tasksReducer,
    timeEntries: timeEntriesReducer,
    userGroups: userGroupsReducer,
    users: usersReducer,
    workspaces: workspacesReducer,
  });
