import { createSelector } from 'reselect';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { selectTogglClientRecordsByWorkspaceId } from '../clients/clientsSelectors';
import { selectTogglProjectRecordsByWorkspaceId } from '../projects/projectsSelectors';
import { selectTogglTagRecordsByWorkspaceId } from '../tags/tagsSelectors';
import { selectTogglTaskRecordsByWorkspaceId } from '../tasks/tasksSelectors';
import { selectTogglTimeEntryRecordsByWorkspaceId } from '../timeEntries/timeEntriesSelectors';
import { selectTogglUserGroupRecordsByWorkspaceId } from '../userGroups/userGroupsSelectors';
import { EntityGroup, EntityModel } from '../../../types/commonTypes';
import { WorkspaceModel } from '../../../types/workspacesTypes';
import { State } from '../../rootReducer';
import { selectTogglUserRecordsByWorkspaceId } from '../users/usersSelectors';

const selectTogglWorkspaceRecords = createSelector(
  (state: State) => state.entities.workspaces.toggl.workspacesById,
  workspacesById =>
    isEmpty(workspacesById) ? [] : Object.values(workspacesById),
);

export const selectTogglWorkspacesById = createSelector(
  selectTogglWorkspaceRecords,
  (workspaceRecords): Record<string, WorkspaceModel> =>
    workspaceRecords.reduce(
      (acc, workspaceRecord) => ({
        ...acc,
        [workspaceRecord.id]: workspaceRecord,
      }),
      {},
    ),
);

export const selectTogglIncludedWorkspacesById = createSelector(
  selectTogglWorkspacesById,
  (workspacesById): Record<string, WorkspaceModel> =>
    Object.entries(workspacesById).reduce(
      (acc, [workspaceId, workspaceRecord]) => {
        if (!workspaceRecord.isIncluded) return acc;
        return {
          ...acc,
          [workspaceId]: workspaceRecord,
        };
      },
      {},
    ),
);

export const selectTogglIncludedWorkspaceRecords = createSelector(
  selectTogglIncludedWorkspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const selectTogglIncludedWorkspacesCount = createSelector(
  selectTogglIncludedWorkspaceRecords,
  (workspaceRecords): number => workspaceRecords.length,
);

export const selectTogglWorkspaceIncludedYearsCount = createSelector(
  selectTogglWorkspacesById,
  (workspacesById): Record<string, number> =>
    Object.entries(workspacesById).reduce(
      (acc, [workspaceId, { inclusionsByYear }]) => {
        const includedYears = Object.values(inclusionsByYear).filter(Boolean);
        return {
          ...acc,
          [workspaceId]: includedYears.length,
        };
      },
      {},
    ),
);

export const selectTogglWorkspaceIds = createSelector(
  (state: State) => state.entities.workspaces.toggl.workspaceIds,
  (workspaceIds): string[] => workspaceIds,
);

export const selectIfTogglWorkspaceYearsFetched = createSelector(
  [selectTogglWorkspacesById, selectTogglWorkspaceIds],
  (workspacesById, workspaceIds): boolean => {
    if (isEmpty(workspacesById)) return false;

    const hasYearInclusionsCount = Object.entries(workspacesById).reduce(
      (acc, [workspaceId, { inclusionsByYear }]) =>
        acc + (isEmpty(inclusionsByYear) ? 0 : 1),
      0,
    );
    return hasYearInclusionsCount === workspaceIds.length;
  },
);

export const selectWorkspaceNameBeingFetched = createSelector(
  (state: State) => state.entities.workspaces.workspaceNameBeingFetched,
  (workspaceNameBeingFetched): string => workspaceNameBeingFetched,
);

export const selectTogglEntitiesByWorkspaceId = createSelector(
  [
    selectTogglWorkspaceIds,
    selectTogglClientRecordsByWorkspaceId,
    selectTogglProjectRecordsByWorkspaceId,
    selectTogglTagRecordsByWorkspaceId,
    selectTogglTaskRecordsByWorkspaceId,
    selectTogglTimeEntryRecordsByWorkspaceId,
    selectTogglUserGroupRecordsByWorkspaceId,
    selectTogglUserRecordsByWorkspaceId,
  ],
  (
    workspaceIds,
    clientsByWorkspaceId,
    projectsByWorkspaceId,
    tagsByWorkspaceId,
    tasksByWorkspaceId,
    timeEntriesByWorkspaceId,
    userGroupsByWorkspaceId,
    usersByWorkspaceId,
  ): Record<string, Record<EntityGroup, EntityModel[]>> =>
    workspaceIds.reduce(
      (acc, workspaceId) => ({
        ...acc,
        [workspaceId]: {
          clients: get(clientsByWorkspaceId, workspaceId, []),
          projects: get(projectsByWorkspaceId, workspaceId, []),
          tags: get(tagsByWorkspaceId, workspaceId, []),
          tasks: get(tasksByWorkspaceId, workspaceId, []),
          timeEntries: get(timeEntriesByWorkspaceId, workspaceId, []),
          userGroups: get(userGroupsByWorkspaceId, workspaceId, []),
          users: get(usersByWorkspaceId, workspaceId, []),
        },
      }),
      {},
    ),
);
