import { createSelector } from 'reselect';
import filter from 'lodash/filter';
import first from 'lodash/first';
import get from 'lodash/get';
import {
  selectClockifyProjectsById,
  selectTogglProjectsById,
} from '~/redux/entities/projects/projectsSelectors';
import {
  selectClockifyTagIdsByName,
  selectTogglTagIdsByName,
} from '~/redux/entities/tags/tagsSelectors';
import {
  selectClockifyTasksById,
  selectTogglTasksById,
} from '~/redux/entities/tasks/tasksSelectors';
import {
  selectClockifyUsersById,
  selectTogglUsersById,
} from '~/redux/entities/users/usersSelectors';
import { EntityModel, ReduxState } from '~/types/commonTypes';
import {
  DetailedTimeEntryModel,
  TimeEntryModel,
} from '~/types/timeEntriesTypes';

const selectClockifyTimeEntriesById = createSelector(
  (state: ReduxState) => state.entities.timeEntries.clockify.byId,
  timeEntriesById => timeEntriesById,
);

const selectTogglTimeEntriesById = createSelector(
  (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  timeEntriesById => timeEntriesById,
);

const getTagList = (tags: string[]): string => {
  if (tags.length === 0) return '';
  if (tags.length === 1) return first(tags);
  return tags.reduce((acc, tag) => `${acc}${tag}, `, '');
};

const getDetailedTimeEntryRecords = (
  timeEntriesById: Record<string, TimeEntryModel>,
  projectsById: Record<string, EntityModel>,
  tagIdsByName: Record<string, string>,
  tasksById: Record<string, EntityModel>,
  usersById: Record<string, EntityModel>,
): DetailedTimeEntryModel[] => {
  const timeEntryRecords = Object.values(timeEntriesById).map(
    ({ projectId, taskId, userId, tags, ...timeEntryRecord }) => ({
      ...timeEntryRecord,
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

  return timeEntryRecords.sort((a, b) => b.start.getTime() - a.start.getTime());
};

const selectClockifyDetailedTimeEntryRecords = createSelector(
  [
    selectClockifyTimeEntriesById,
    selectClockifyProjectsById,
    selectClockifyTagIdsByName,
    selectClockifyTasksById,
    selectClockifyUsersById,
  ],
  (...args): DetailedTimeEntryModel[] => getDetailedTimeEntryRecords(...args),
);

const selectTogglDetailedTimeEntryRecords = createSelector(
  [
    selectTogglTimeEntriesById,
    selectTogglProjectsById,
    selectTogglTagIdsByName,
    selectTogglTasksById,
    selectTogglUsersById,
  ],
  (...args): DetailedTimeEntryModel[] => getDetailedTimeEntryRecords(...args),
);

const getTimeEntriesByWorkspaceId = (
  timeEntryRecords: TimeEntryModel[],
  workspaceIds: string[],
): Record<string, TimeEntryModel[]> =>
  workspaceIds.reduce(
    (acc, workspaceId) => ({
      ...acc,
      [workspaceId]: filter(timeEntryRecords, { workspaceId }),
    }),
    {},
  );

export const selectClockifyTimeEntriesByWorkspaceId = createSelector(
  [
    selectClockifyDetailedTimeEntryRecords,
    (state: ReduxState) => state.entities.workspaces.clockify.idValues,
  ],
  (timeEntryRecords, workspaceIds): Record<string, TimeEntryModel[]> =>
    getTimeEntriesByWorkspaceId(timeEntryRecords, workspaceIds),
);

export const selectTogglTimeEntriesByWorkspaceId = createSelector(
  [
    selectTogglDetailedTimeEntryRecords,
    (state: ReduxState) => state.entities.workspaces.toggl.idValues,
  ],
  (timeEntryRecords, workspaceIds): Record<string, TimeEntryModel[]> =>
    getTimeEntriesByWorkspaceId(timeEntryRecords, workspaceIds),
);

export const selectTogglTimeEntryInclusionsByWorkspaceId = createSelector(
  [selectClockifyTimeEntriesByWorkspaceId, selectTogglTimeEntriesByWorkspaceId],
  (
    clockifyTimeEntriesByWorkspaceId,
    togglTimeEntriesByWorkspaceId,
  ): Record<string, TimeEntryModel[]> => {
    // TODO: Write this!
    return togglTimeEntriesByWorkspaceId;
  },
);
