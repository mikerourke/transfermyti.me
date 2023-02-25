import { combineReducers } from "@reduxjs/toolkit";

import {
  allEntitiesInitialState,
  allEntitiesReducer,
} from "~/modules/allEntities/allEntitiesReducer";
import { appInitialState, appReducer } from "~/modules/app/appReducer";
import {
  clientsInitialState,
  clientsReducer,
} from "~/modules/clients/clientsReducer";
import {
  credentialsInitialState,
  credentialsReducer,
} from "~/modules/credentials/credentialsReducer";
import {
  projectsInitialState,
  projectsReducer,
} from "~/modules/projects/projectsReducer";
import { tagsInitialState, tagsReducer } from "~/modules/tags/tagsReducer";
import { tasksInitialState, tasksReducer } from "~/modules/tasks/tasksReducer";
import {
  timeEntriesInitialState,
  timeEntriesReducer,
} from "~/modules/timeEntries/timeEntriesReducer";
import {
  userGroupsInitialState,
  userGroupsReducer,
} from "~/modules/userGroups/userGroupsReducer";
import { usersInitialState, usersReducer } from "~/modules/users/usersReducer";
import {
  workspacesInitialState,
  workspacesReducer,
} from "~/modules/workspaces/workspacesReducer";

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
