import { createSelector } from 'reselect';
import { filter, first, get } from 'lodash';
import { EntityModel, ReduxState, ToolName } from '~/types/commonTypes';
import { TagModel } from '~/types/tagsTypes';
import {
  DetailedTimeEntryModel,
  TimeEntryModel,
} from '~/types/timeEntriesTypes';

export const selectClockifyTimeEntriesById = createSelector(
  (state: ReduxState) => state.entities.timeEntries.clockify.byId,
  timeEntries => timeEntries,
);

export const selectTogglTimeEntriesById = createSelector(
  (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  timeEntries => timeEntries,
);

const selectDetailedTimeEntriesFactory = (toolName: ToolName) =>
  createSelector(
    (state: ReduxState) => state.entities.timeEntries[toolName].byId,
    (state: ReduxState) => state.entities.projects[toolName].byId,
    (state: ReduxState) => state.entities.tags[toolName].byId,
    (state: ReduxState) => state.entities.tasks[toolName].byId,
    (state: ReduxState) => state.entities.users[toolName].byId,
    (
      timeEntriesById: Record<string, TimeEntryModel>,
      projectsById: Record<string, EntityModel>,
      tagsById: Record<string, TagModel>,
      tasksById: Record<string, EntityModel>,
      usersById: Record<string, EntityModel>,
    ): DetailedTimeEntryModel[] => {
      const tagIdsByName = Object.values(tagsById).reduce(
        (acc, { id, name }) => ({ ...acc, [name]: id.toString() }),
        {},
      );

      const timeEntries = Object.values(timeEntriesById).map(
        ({ projectId, taskId, userId, tags, ...timeEntry }) => ({
          ...timeEntry,
          projectId,
          taskId,
          userId,
          tags,
          workspaceId: get(projectsById, [projectId, 'workspaceId'], null),
          projectName: get(projectsById, [projectId, 'name'], null),
          taskName: get(tasksById, [taskId, 'name'], null),
          userName: get(usersById, [userId, 'name'], null),
          tagIds: tags.map(tag => get(tagIdsByName, tag, null)),
          tagList: getTagList(tags),
        }),
        [],
      );

      return timeEntries.sort((a, b) => b.start.getTime() - a.start.getTime());
    },
  );

const groupTimeEntriesByWorkspace = (
  timeEntries: TimeEntryModel[],
  workspaceIds: string[],
): Record<string, TimeEntryModel[]> =>
  workspaceIds.reduce(
    (acc, workspaceId) => ({
      ...acc,
      [workspaceId]: filter(timeEntries, { workspaceId }),
    }),
    {},
  );

const getTagList = (tags: string[]): string => {
  if (tags.length === 0) return '';
  if (tags.length === 1) return first(tags);
  return tags.reduce((acc, tag) => `${acc}${tag}, `, '');
};

export const selectClockifyTimeEntriesByWorkspaceId = createSelector(
  selectDetailedTimeEntriesFactory(ToolName.Clockify),
  (state: ReduxState) => state.entities.workspaces.clockify.idValues,
  (timeEntries, workspaceIds): Record<string, TimeEntryModel[]> =>
    groupTimeEntriesByWorkspace(timeEntries, workspaceIds),
);

export const selectTogglTimeEntriesByWorkspaceId = createSelector(
  selectDetailedTimeEntriesFactory(ToolName.Toggl),
  (state: ReduxState) => state.entities.workspaces.toggl.idValues,
  (timeEntries, workspaceIds): Record<string, TimeEntryModel[]> =>
    groupTimeEntriesByWorkspace(timeEntries, workspaceIds),
);

export const selectTogglTimeEntriesByWorkspaceFactory = (
  inclusionsOnly: boolean,
) =>
  createSelector(
    selectClockifyTimeEntriesByWorkspaceId,
    selectTogglTimeEntriesByWorkspaceId,
    (
      clockifyTimeEntriesByWorkspaceId,
      togglTimeEntriesByWorkspaceId,
    ): Record<string, TimeEntryModel[]> => {
      // TODO: Write this!
      return togglTimeEntriesByWorkspaceId;
    },
  );
