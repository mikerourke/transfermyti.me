import { combineReducers } from "@reduxjs/toolkit";

import {
  allEntitiesInitialState,
  allEntitiesReducer,
} from "~/redux/allEntities/allEntitiesReducer";
import { appInitialState, appReducer } from "~/redux/app/appReducer";
import {
  clientsInitialState,
  clientsReducer,
} from "~/redux/clients/clientsReducer";
import {
  credentialsInitialState,
  credentialsReducer,
} from "~/redux/credentials/credentialsReducer";
import {
  projectsInitialState,
  projectsReducer,
} from "~/redux/projects/projectsReducer";
import { tagsInitialState, tagsReducer } from "~/redux/tags/tagsReducer";
import { tasksInitialState, tasksReducer } from "~/redux/tasks/tasksReducer";
import {
  timeEntriesInitialState,
  timeEntriesReducer,
} from "~/redux/timeEntries/timeEntriesReducer";
import {
  userGroupsInitialState,
  userGroupsReducer,
} from "~/redux/userGroups/userGroupsReducer";
import { usersInitialState, usersReducer } from "~/redux/users/usersReducer";
import {
  workspacesInitialState,
  workspacesReducer,
} from "~/redux/workspaces/workspacesReducer";

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
