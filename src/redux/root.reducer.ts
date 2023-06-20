import { combineReducers } from "@reduxjs/toolkit";

import {
  allEntitiesInitialState,
  allEntitiesReducer,
} from "~/redux/allEntities/allEntities.reducer";
import { appInitialState, appReducer } from "~/redux/app/app.reducer";
import {
  clientsInitialState,
  clientsReducer,
} from "~/redux/clients/clients.reducer";
import {
  credentialsInitialState,
  credentialsReducer,
} from "~/redux/credentials/credentials.reducer";
import {
  projectsInitialState,
  projectsReducer,
} from "~/redux/projects/projects.reducer";
import { tagsInitialState, tagsReducer } from "~/redux/tags/tags.reducer";
import { tasksInitialState, tasksReducer } from "~/redux/tasks/tasks.reducer";
import {
  timeEntriesInitialState,
  timeEntriesReducer,
} from "~/redux/timeEntries/timeEntries.reducer";
import {
  userGroupsInitialState,
  userGroupsReducer,
} from "~/redux/userGroups/userGroups.reducer";
import { usersInitialState, usersReducer } from "~/redux/users/users.reducer";
import {
  workspacesInitialState,
  workspacesReducer,
} from "~/redux/workspaces/workspaces.reducer";

export const initialState = {
  allEntities: { ...allEntitiesInitialState },
  app: { ...appInitialState },
  clients: { ...clientsInitialState },
  credentials: { ...credentialsInitialState },
  projects: { ...projectsInitialState },
  tags: { ...tagsInitialState },
  tasks: { ...tasksInitialState },
  timeEntries: { ...timeEntriesInitialState },
  userGroups: { ...userGroupsInitialState },
  users: { ...usersInitialState },
  workspaces: { ...workspacesInitialState },
};

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
