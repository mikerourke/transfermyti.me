import { createSelector } from 'reselect';
import filter from 'lodash/filter';
import first from 'lodash/first';
import get from 'lodash/get';
import { selectTogglProjectsById } from '../projects/projectsSelectors';
import {
  DetailedTimeEntryModel,
  TimeEntryModel,
} from '../../../types/timeEntriesTypes';
import { State } from '../../rootReducer';
import { selectTogglTasksById } from '../tasks/tasksSelectors';
import { selectTogglUsersById } from '../users/usersSelectors';
import { selectTogglTagIdsByName } from '../tags/tagsSelectors';

const selectTogglTimeEntriesById = createSelector(
  (state: State) => state.entities.timeEntries.toggl.timeEntriesById,
  timeEntriesById => timeEntriesById,
);

const getTagList = (tags: string[]): string => {
  if (tags.length === 0) return '';
  if (tags.length === 1) return first(tags);
  return tags.reduce((acc, tag) => `${acc}${tag}, `, '');
};

export const selectTogglDetailedTimeEntryRecords = createSelector(
  [
    selectTogglTimeEntriesById,
    selectTogglProjectsById,
    selectTogglTagIdsByName,
    selectTogglTasksById,
    selectTogglUsersById,
  ],
  (
    timeEntriesById,
    projectsById,
    tagIdsByName,
    tasksById,
    usersById,
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
    return timeEntryRecords.sort(
      (a, b) => b.start.getTime() - a.start.getTime(),
    );
  },
);

export const selectTogglTimeEntryRecordsByWorkspaceId = createSelector(
  [
    selectTogglDetailedTimeEntryRecords,
    (state: State) => state.entities.workspaces.toggl.workspaceIds,
  ],
  (timeEntryRecords, workspaceIds): Record<string, TimeEntryModel[]> =>
    workspaceIds.reduce(
      (acc, workspaceId) => ({
        ...acc,
        [workspaceId]: filter(timeEntryRecords, { workspaceId }),
      }),
      {},
    ),
);
