import { combineReducers } from "redux";

import { allEntitiesReducer } from "~/modules/allEntities/allEntitiesReducer";
import { appReducer } from "~/modules/app/appReducer";
import { clientsReducer } from "~/modules/clients/clientsReducer";
import { credentialsReducer } from "~/modules/credentials/credentialsReducer";
import { projectsReducer } from "~/modules/projects/projectsReducer";
import { tagsReducer } from "~/modules/tags/tagsReducer";
import { tasksReducer } from "~/modules/tasks/tasksReducer";
import { timeEntriesReducer } from "~/modules/timeEntries/timeEntriesReducer";
import { userGroupsReducer } from "~/modules/userGroups/userGroupsReducer";
import { usersReducer } from "~/modules/users/usersReducer";
import { workspacesReducer } from "~/modules/workspaces/workspacesReducer";

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
