import { createSelector } from "reselect";
import { selectIncludedSourceClients } from "~/clients/clientsSelectors";
import { selectIncludedSourceProjects } from "~/projects/projectsSelectors";
import { selectIncludedSourceTags } from "~/tags/tagsSelectors";
import { selectIncludedSourceTasks } from "~/tasks/tasksSelectors";
import { selectIncludedSourceTimeEntries } from "~/timeEntries/timeEntriesSelectors";
import { selectIncludedSourceUserGroups } from "~/userGroups/userGroupsSelectors";
import { selectIncludedSourceUsers } from "~/users/usersSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { EntityGroup, BaseEntityModel } from "./entitiesTypes";

export const selectIfEntitiesFetching = createSelector(
  (state: ReduxState) => state.clients.isFetching,
  (state: ReduxState) => state.projects.isFetching,
  (state: ReduxState) => state.tags.isFetching,
  (state: ReduxState) => state.tasks.isFetching,
  (state: ReduxState) => state.userGroups.isFetching,
  (state: ReduxState) => state.users.isFetching,
  (...args: boolean[]) => [...args].some(Boolean),
);

export const selectSourceRecordsByEntityGroup = createSelector(
  selectIncludedSourceClients,
  selectIncludedSourceProjects,
  selectIncludedSourceTags,
  selectIncludedSourceTasks,
  selectIncludedSourceTimeEntries,
  selectIncludedSourceUserGroups,
  selectIncludedSourceUsers,
  (
    sourceClients,
    sourceProjects,
    sourceTags,
    sourceTasks,
    sourceTimeEntries,
    sourceUserGroups,
    sourceUsers,
  ): Record<string, BaseEntityModel[]> => ({
    [EntityGroup.Clients]: sourceClients,
    [EntityGroup.Projects]: sourceProjects,
    [EntityGroup.Tags]: sourceTags,
    [EntityGroup.Tasks]: sourceTasks,
    [EntityGroup.TimeEntries]: sourceTimeEntries,
    [EntityGroup.UserGroups]: sourceUserGroups,
    [EntityGroup.Users]: sourceUsers,
  }),
);
