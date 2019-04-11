import { createSelector } from 'reselect';
import { filter, first, get } from 'lodash';
import { EntityModel, ReduxState, ToolName } from '~/types/commonTypes';
import { TagModel } from '~/types/tagsTypes';
import {
  DetailedTimeEntryModel,
  TimeEntryModel,
} from '~/types/timeEntriesTypes';

export const selectTogglTimeEntriesById = createSelector(
  (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  timeEntries => timeEntries,
);

const getTagList = (tags: Array<string>): string => {
  if (tags.length === 0) return '';
  if (tags.length === 1) return first(tags);
  return tags.reduce((acc, tag) => `${acc}${tag}, `, '');
};

const selectDetailedTimeEntriesByWorkspaceFactory = (toolName: ToolName) =>
  createSelector(
    (state: ReduxState) => state.entities.workspaces[toolName].idValues,
    (state: ReduxState) => state.entities.timeEntries[toolName].byId,
    (state: ReduxState) => state.entities.projects[toolName].byId,
    (state: ReduxState) => state.entities.tags[toolName].byId,
    (state: ReduxState) => state.entities.tasks[toolName].byId,
    (state: ReduxState) => state.entities.users[toolName].byId,
    (
      workspaceIds: Array<string>,
      timeEntriesById: Record<string, TimeEntryModel>,
      projectsById: Record<string, EntityModel>,
      tagsById: Record<string, TagModel>,
      tasksById: Record<string, EntityModel>,
      usersById: Record<string, EntityModel>,
    ): Record<string, Array<DetailedTimeEntryModel>> => {
      const tagIdsByName = Object.values(tagsById).reduce(
        (acc, { id, name }) => ({ ...acc, [name]: id.toString() }),
        {},
      );

      const timeEntries = Object.values(timeEntriesById).map(
        ({ projectId, taskId, userId, tags, ...timeEntry }) => {
          const matchingProject = get(projectsById, projectId, {});

          return {
            ...timeEntry,
            projectId,
            taskId,
            userId,
            tags,
            isActive: get(matchingProject, 'isActive', false),
            workspaceId: get(matchingProject, 'workspaceId', null),
            projectName: get(matchingProject, 'name', null),
            taskName: get(tasksById, [taskId, 'name'], null),
            userName: get(usersById, [userId, 'name'], null),
            tagIds: tags.map(tag => get(tagIdsByName, tag, null)),
            tagList: getTagList(tags),
          };
        },
        [],
      );

      const sortedEntries = timeEntries.sort(
        (a, b) => b.start.getTime() - a.start.getTime(),
      );

      return workspaceIds.reduce(
        (acc, workspaceId) => ({
          ...acc,
          [workspaceId]: filter(sortedEntries, { workspaceId }),
        }),
        {},
      );
    },
  );

export const selectTimeEntriesByWorkspaceFactory = (
  toolName: ToolName,
  inclusionsOnly: boolean,
) =>
  createSelector(
    selectDetailedTimeEntriesByWorkspaceFactory(toolName),
    (timeEntriesByWorkspace): Record<string, Array<TimeEntryModel>> =>
      Object.entries(timeEntriesByWorkspace).reduce(
        (acc, [workspaceId, timeEntries]) => ({
          ...acc,
          [workspaceId]: inclusionsOnly
            ? timeEntries.filter(({ isIncluded }) => isIncluded)
            : timeEntries,
        }),
        {},
      ),
  );
