import { createSelector } from 'reselect';
import { compact, filter, get, isNil } from 'lodash';
import { CompoundEntityModel, ReduxState, ToolName } from '~/types/commonTypes';
import {
  CompoundTimeEntryModel,
  CreateTimeEntryRequestModel,
  DetailedTimeEntryModel,
} from '~/types/timeEntriesTypes';
import { CompoundWorkspaceModel } from '~/types/workspacesTypes';

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
      clientsById: Record<string, CompoundEntityModel>,
      projectsById: Record<string, CompoundEntityModel>,
      tagsById: Record<string, CompoundEntityModel>,
      tasksById: Record<string, CompoundEntityModel>,
      timeEntriesById: Record<string, CompoundTimeEntryModel>,
      usersById: Record<string, CompoundEntityModel>,
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

export const selectTimeEntriesTransferPayloadForWorkspace = createSelector(
  selectTimeEntriesByWorkspaceFactory(ToolName.Toggl, true),
  inclusionsByWorkspaceId => (
    workspaceIdToGet: string,
  ): Array<
    CreateTimeEntryRequestModel & { projectName: string; workspaceName: string }
  > => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as Array<DetailedTimeEntryModel>;

    return inclusions.reduce((acc, timeEntry) => {
      const tagIds = timeEntry.tags.reduce((acc, { linkedId, isIncluded }) => {
        if (isNil(linkedId) || !isIncluded) return acc;
        return [...acc, linkedId];
      }, []);

      return [
        ...acc,
        {
          start: timeEntry.start,
          billable: timeEntry.isBillable,
          description: timeEntry.description,
          end: timeEntry.end,
          projectId: get(timeEntry, ['project', 'linkedId'], null),
          taskId: get(timeEntry, ['task', 'linkedId'], null),
          tagIds,
          projectName: get(timeEntry, ['project', 'name'], null),
          workspaceName: get(timeEntry, ['workspace', 'name'], null),
        },
      ];
    }, []);
  },
);
