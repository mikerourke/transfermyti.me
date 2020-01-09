import { createSelector } from "reselect";
import { getEntityGroupDisplay } from "~/utils";
import { includedSourceClientsSelector } from "~/clients/clientsSelectors";
import { includedSourceProjectsSelector } from "~/projects/projectsSelectors";
import { includedSourceTagsSelector } from "~/tags/tagsSelectors";
import { includedSourceTasksSelector } from "~/tasks/tasksSelectors";
import { includedSourceTimeEntriesSelector } from "~/timeEntries/timeEntriesSelectors";
import {
  CountsByEntityGroupModel,
  EntityGroup,
  FetchStatus,
  ReduxState,
} from "~/typeDefs";

export const areExistsInTargetShownSelector = (state: ReduxState): boolean =>
  state.allEntities.areExistsInTargetShown;

export const fetchAllFetchStatusSelector = (state: ReduxState): FetchStatus =>
  state.allEntities.fetchAllFetchStatus;

export const pushAllChangesFetchStatusSelector = (
  state: ReduxState,
): FetchStatus => state.allEntities.pushAllChangesFetchStatus;

export const entityGroupInProcessDisplaySelector = createSelector(
  (state: ReduxState) => state.allEntities.entityGroupInProcess,
  (entityGroupInProcess): string =>
    getEntityGroupDisplay(entityGroupInProcess).toLowerCase(),
);

export const transferCountsByEntityGroupSelector = createSelector(
  (state: ReduxState) => state.allEntities.transferCountsByEntityGroup,
  (transferCountsByEntityGroup): CountsByEntityGroupModel =>
    transferCountsByEntityGroup,
);

export const includedCountsByEntityGroupSelector = createSelector(
  includedSourceClientsSelector,
  includedSourceTagsSelector,
  includedSourceProjectsSelector,
  includedSourceTasksSelector,
  includedSourceTimeEntriesSelector,
  (
    sourceClients,
    sourceTags,
    sourceProjects,
    sourceTasks,
    sourceTimeEntries,
  ): CountsByEntityGroupModel =>
    ({
      [EntityGroup.Clients]: sourceClients.length,
      [EntityGroup.Tags]: sourceTags.length,
      [EntityGroup.Projects]: sourceProjects.length,
      [EntityGroup.Tasks]: sourceTasks.length,
      [EntityGroup.TimeEntries]: sourceTimeEntries.length,
      [EntityGroup.UserGroups]: 0,
      [EntityGroup.Users]: 0,
    } as CountsByEntityGroupModel),
);

export const totalIncludedRecordsCountSelector = createSelector(
  includedCountsByEntityGroupSelector,
  (includedCountsByEntityGroup): number =>
    Object.values(includedCountsByEntityGroup).reduce(
      (acc, recordCount) => acc + recordCount,
      0,
    ),
);
