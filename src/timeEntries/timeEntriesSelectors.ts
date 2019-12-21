import { createSelector, Selector } from "reselect";
import { compact, filter, get } from "lodash";
import {
  EntitiesByGroupModel,
  EntityGroup,
  EntityGroupsByKey,
  ToolName,
} from "~/common/commonTypes";
import { CompoundClientModel } from "~/clients/clientsTypes";
import { CompoundProjectModel } from "~/projects/projectsTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { CompoundTagModel } from "~/tags/tagsTypes";
import { CompoundTaskModel } from "~/tasks/tasksTypes";
import { CompoundUserModel } from "~/users/usersTypes";
import { CompoundWorkspaceModel } from "~/workspaces/workspacesTypes";
import {
  CompoundTimeEntryModel,
  DetailedTimeEntryModel,
} from "./timeEntriesTypes";

export const selectEntitiesByGroupFactory = (
  toolName: ToolName,
): Selector<ReduxState, EntitiesByGroupModel> =>
  createSelector(
    (state: ReduxState) => state,
    (entitiesByEntityGroup): EntitiesByGroupModel =>
      Object.values(EntityGroup).reduce(
        (acc, entityGroup) => ({
          ...acc,
          [entityGroup]: get(
            entitiesByEntityGroup,
            [entityGroup, toolName],
            {},
          ),
        }),
        {} as EntitiesByGroupModel,
      ),
  );

export const selectTogglTimeEntriesById = createSelector(
  (state: ReduxState) => state.timeEntries.toggl.byId,
  timeEntries => timeEntries,
);

export const selectTimeEntriesByWorkspaceFactory = (
  toolName: ToolName,
  inclusionsOnly: boolean,
): Selector<ReduxState, EntityGroupsByKey<DetailedTimeEntryModel>> =>
  createSelector(
    (state: ReduxState) => state.clients[toolName].byId,
    (state: ReduxState) => state.projects[toolName].byId,
    (state: ReduxState) => state.tags[toolName].byId,
    (state: ReduxState) => state.tasks[toolName].byId,
    (state: ReduxState) => state.timeEntries[toolName].byId,
    (state: ReduxState) => state.users[toolName].byId,
    (state: ReduxState) => state.workspaces[toolName].byId,
    (
      clientsById: Record<string, CompoundClientModel>,
      projectsById: Record<string, CompoundProjectModel>,
      tagsById: Record<string, CompoundTagModel>,
      tasksById: Record<string, CompoundTaskModel>,
      timeEntriesById: Record<string, CompoundTimeEntryModel>,
      usersById: Record<string, CompoundUserModel>,
      workspacesById: Record<string, CompoundWorkspaceModel>,
    ): EntityGroupsByKey<DetailedTimeEntryModel> => {
      const allTimeEntries = Object.values(timeEntriesById);

      const tagsByName = Object.values(tagsById).reduce(
        (acc, tag) => ({
          ...acc,
          [tag.name]: tag,
        }),
        {},
      );

      const timeEntriesToUse = inclusionsOnly
        ? allTimeEntries.filter(({ isIncluded }) => isIncluded)
        : allTimeEntries;

      const timeEntries = timeEntriesToUse.map(timeEntry => {
        return {
          ...timeEntry,
          client: get(clientsById, timeEntry.clientId, null),
          project: get(projectsById, timeEntry.projectId, null),
          task: get(tasksById, timeEntry.taskId, null),
          tags: compact(
            timeEntry.tagNames.map(tagName => get(tagsByName, tagName, null)),
          ),
          user: get(usersById, timeEntry.userId, null),
          workspace: get(workspacesById, timeEntry.workspaceId, null),
        };
      });

      const sortedEntries = timeEntries.sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
      );

      return Object.keys(workspacesById).reduce(
        (acc, workspaceId) => ({
          ...acc,
          [workspaceId]: filter(sortedEntries, { workspaceId }),
        }),
        {},
      );
    },
  );

export const selectTimeEntriesForWorkspace = createSelector(
  selectTimeEntriesByWorkspaceFactory(ToolName.Toggl, true),
  inclusionsByWorkspace => (
    workspaceIdToGet: string,
  ): DetailedTimeEntryModel[] =>
    get(inclusionsByWorkspace, workspaceIdToGet, []),
);
