import { createSelector } from "reselect";
import { includedSourceClientsSelector } from "~/clients/clientsSelectors";
import { includedSourceProjectsSelector } from "~/projects/projectsSelectors";
import { includedSourceTagsSelector } from "~/tags/tagsSelectors";
import { includedSourceTasksSelector } from "~/tasks/tasksSelectors";
import { includedSourceTimeEntriesSelector } from "~/timeEntries/timeEntriesSelectors";
import { includedSourceUserGroupsSelector } from "~/userGroups/userGroupsSelectors";
import { includedSourceUsersSelector } from "~/users/usersSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { EntityGroup, BaseEntityModel } from "./allEntitiesTypes";

export const areEntitiesFetchingSelector = createSelector(
  (state: ReduxState) => state.clients.isFetching,
  (state: ReduxState) => state.projects.isFetching,
  (state: ReduxState) => state.tags.isFetching,
  (state: ReduxState) => state.tasks.isFetching,
  (state: ReduxState) => state.userGroups.isFetching,
  (state: ReduxState) => state.users.isFetching,
  (...args: boolean[]) => [...args].some(Boolean),
);

export const sourceRecordsByEntityGroupSelector = createSelector(
  includedSourceClientsSelector,
  includedSourceProjectsSelector,
  includedSourceTagsSelector,
  includedSourceTasksSelector,
  includedSourceTimeEntriesSelector,
  includedSourceUserGroupsSelector,
  includedSourceUsersSelector,
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
