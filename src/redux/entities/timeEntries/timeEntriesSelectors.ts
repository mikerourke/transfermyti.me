import { createSelector } from 'reselect';
import { compact, filter, get } from 'lodash';
import {
  CompoundClientModel,
  CompoundProjectModel,
  CompoundTagModel,
  CompoundTaskModel,
  CompoundTimeEntryModel,
  CompoundUserModel,
  CompoundWorkspaceModel,
  DetailedTimeEntryModel,
  ReduxState,
  ToolName,
} from '~/types';

export const selectTogglTimeEntriesById = createSelector(
  (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  timeEntries => timeEntries,
);

export const selectTimeEntriesByWorkspaceFactory = (
  toolName: ToolName,
  inclusionsOnly: boolean,
) =>
  createSelector(
    (state: ReduxState) => state.entities.clients[toolName].byId,
    (state: ReduxState) => state.entities.projects[toolName].byId,
    (state: ReduxState) => state.entities.tags[toolName].byId,
    (state: ReduxState) => state.entities.tasks[toolName].byId,
    (state: ReduxState) => state.entities.timeEntries[toolName].byId,
    (state: ReduxState) => state.entities.users[toolName].byId,
    (state: ReduxState) => state.entities.workspaces[toolName].byId,
    (
      clientsById: Record<string, CompoundClientModel>,
      projectsById: Record<string, CompoundProjectModel>,
      tagsById: Record<string, CompoundTagModel>,
      tasksById: Record<string, CompoundTaskModel>,
      timeEntriesById: Record<string, CompoundTimeEntryModel>,
      usersById: Record<string, CompoundUserModel>,
      workspacesById: Record<string, CompoundWorkspaceModel>,
    ): Record<string, Array<DetailedTimeEntryModel>> => {
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
        (a, b) => b.start.getTime() - a.start.getTime(),
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
  inclusionsByWorkspaceId => (
    workspaceIdToGet: string,
  ): Array<DetailedTimeEntryModel> =>
    get(inclusionsByWorkspaceId, workspaceIdToGet, []),
);
