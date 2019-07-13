import { combineReducers } from "redux";
import { clientsReducer, ClientsState } from "./clients/clientsReducer";
import { projectsReducer, ProjectsState } from "./projects/projectsReducer";
import { tagsReducer, TagsState } from "./tags/tagsReducer";
import { tasksReducer, TasksState } from "./tasks/tasksReducer";
import {
  timeEntriesReducer,
  TimeEntriesState,
} from "./timeEntries/timeEntriesReducer";
import {
  userGroupsReducer,
  UserGroupsState,
} from "./userGroups/userGroupsReducer";
import { usersReducer, UsersState } from "./users/usersReducer";
import {
  workspacesReducer,
  WorkspacesState,
} from "./workspaces/workspacesReducer";

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

export const entitiesReducer = combineReducers({
  clients: clientsReducer,
  projects: projectsReducer,
  tags: tagsReducer,
  tasks: tasksReducer,
  timeEntries: timeEntriesReducer,
  userGroups: userGroupsReducer,
  users: usersReducer,
  workspaces: workspacesReducer,
});
