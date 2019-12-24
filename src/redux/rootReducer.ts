import { combineReducers, Reducer } from "redux";
import { appReducer, AppState } from "~/app/appReducer";
import { clientsReducer, ClientsState } from "~/clients/clientsReducer";
import {
  credentialsReducer,
  CredentialsState,
} from "~/credentials/credentialsReducer";
import { projectsReducer, ProjectsState } from "~/projects/projectsReducer";
import { tagsReducer, TagsState } from "~/tags/tagsReducer";
import { tasksReducer, TasksState } from "~/tasks/tasksReducer";
import {
  timeEntriesReducer,
  TimeEntriesState,
} from "~/timeEntries/timeEntriesReducer";
import {
  userGroupsReducer,
  UserGroupsState,
} from "~/userGroups/userGroupsReducer";
import { usersReducer, UsersState } from "~/users/usersReducer";
import {
  workspacesReducer,
  WorkspacesState,
} from "~/workspaces/workspacesReducer";
import { RouterState } from "~/redux/reduxTypes";

export type RouterReducer = Reducer<RouterState>;

export interface State {
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
