import { createSelector } from 'reselect';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import {
  selectTogglClientInclusionsByWorkspaceId,
  selectTogglClientsByWorkspaceId,
} from '../clients/clientsSelectors';
import {
  selectTogglProjectInclusionsByWorkspaceId,
  selectTogglProjectsByWorkspaceId,
} from '../projects/projectsSelectors';
import {
  selectTogglTagsByWorkspaceId,
  selectTogglTagInclusionsByWorkspaceId,
} from '../tags/tagsSelectors';
import {
  selectTogglTaskInclusionsByWorkspaceId,
  selectTogglTasksByWorkspaceId,
} from '../tasks/tasksSelectors';
import {
  selectTogglTimeEntriesByWorkspaceId,
  selectTogglTimeEntryInclusionsByWorkspaceId,
} from '../timeEntries/timeEntriesSelectors';
import {
  selectTogglUserGroupInclusionsByWorkspaceId,
  selectTogglUserGroupsByWorkspaceId,
} from '../userGroups/userGroupsSelectors';
import {
  selectTogglUserInclusionsByWorkspaceId,
  selectTogglUsersByWorkspaceId,
} from '../users/usersSelectors';
import { EntityGroup, EntityModel } from '../../../types/commonTypes';
import { WorkspaceModel } from '../../../types/workspacesTypes';
import { State } from '../../rootReducer';

export const selectTogglWorkspaceIds = createSelector(
  (state: State) => state.entities.workspaces.toggl.idValues,
  (workspaceIds): string[] => workspaceIds,
);

const selectClockifyWorkspacesById = createSelector(
  (state: State) => state.entities.workspaces.clockify.byId,
  (workspacesById): Record<string, WorkspaceModel> => workspacesById,
);

export const selectTogglWorkspacesById = createSelector(
  (state: State) => state.entities.workspaces.toggl.byId,
  (workspacesById): Record<string, WorkspaceModel> => workspacesById,
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

const selectTogglIncludedWorkspacesByName = createSelector(
  selectTogglIncludedWorkspaceRecords,
  (includedWorkspaceRecords): Record<string, WorkspaceModel> =>
    includedWorkspaceRecords.reduce(
      (acc, workspaceRecord) => ({
        ...acc,
        [workspaceRecord.name]: workspaceRecord,
      }),
      {},
    ),
);

export const selectTogglIncludedWorkspaceNames = createSelector(
  selectTogglIncludedWorkspacesByName,
  (workspacesByName): string[] => Object.keys(workspacesByName),
);

export const selectClockifyIncludedWorkspacesById = createSelector(
  [selectClockifyWorkspacesById, selectTogglIncludedWorkspacesByName],
  (clockifyWorkspacesById, togglWorkspacesByName) =>
    Object.entries(clockifyWorkspacesById).reduce(
      (acc, [workspaceId, workspaceRecord]) => {
        if (isNil(togglWorkspacesByName[workspaceRecord.name])) return acc;
        return {
          ...acc,
          [workspaceId]: workspaceRecord,
        };
      },
      {},
    ),
);

export const selectTogglIncludedWorkspacesCount = createSelector(
  selectTogglIncludedWorkspaceRecords,
  (workspaceRecords): number => workspaceRecords.length,
);

export const selectTogglWorkspaceIncludedYears = createSelector(
  [
    selectTogglWorkspacesById,
    selectClockifyWorkspacesById,
    (_: any, clockifyWorkspaceId: string) => clockifyWorkspaceId,
  ],
  (
    togglWorkspacesById,
    clockifyWorkspacesById,
    clockifyWorkspaceId,
  ): number[] => {
    const { linkedId } = get(clockifyWorkspacesById, clockifyWorkspaceId, {
      linkedId: null,
    });
    if (isNil(linkedId)) return [];

    const { inclusionsByYear } = get(togglWorkspacesById, linkedId, {
      inclusionsByYear: null,
    });
    if (isNil(inclusionsByYear)) return [];

    return Object.entries(inclusionsByYear).reduce(
      (acc, [year, isIncluded]) => {
        if (!isIncluded) return acc;
        return [...acc, year];
      },
      [],
    );
  },
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

const getEntityGroupRecordsByWorkspaceId = (
  workspaceIds: string[],
  clientsByWorkspaceId: Record<string, EntityModel[]>,
  projectsByWorkspaceId: Record<string, EntityModel[]>,
  tagsByWorkspaceId: Record<string, EntityModel[]>,
  tasksByWorkspaceId: Record<string, EntityModel[]>,
  timeEntriesByWorkspaceId: Record<string, EntityModel[]>,
  userGroupsByWorkspaceId: Record<string, EntityModel[]>,
  usersByWorkspaceId: Record<string, EntityModel[]>,
): Record<string, Record<EntityGroup, EntityModel[]>> =>
  workspaceIds.reduce(
    (acc, workspaceId) => ({
      ...acc,
      [workspaceId.toString()]: {
        [EntityGroup.Clients]: get(clientsByWorkspaceId, workspaceId, []),
        [EntityGroup.Projects]: get(projectsByWorkspaceId, workspaceId, []),
        [EntityGroup.Tags]: get(tagsByWorkspaceId, workspaceId, []),
        [EntityGroup.Tasks]: get(tasksByWorkspaceId, workspaceId, []),
        [EntityGroup.TimeEntries]: get(
          timeEntriesByWorkspaceId,
          workspaceId,
          [],
        ),
        [EntityGroup.UserGroups]: get(userGroupsByWorkspaceId, workspaceId, []),
        [EntityGroup.Users]: get(usersByWorkspaceId, workspaceId, []),
      },
    }),
    {},
  );

export const selectTogglEntityInclusionsByWorkspaceId = createSelector(
  [
    selectTogglWorkspaceIds,
    selectTogglClientInclusionsByWorkspaceId,
    selectTogglProjectInclusionsByWorkspaceId,
    selectTogglTagInclusionsByWorkspaceId,
    selectTogglTaskInclusionsByWorkspaceId,
    selectTogglTimeEntryInclusionsByWorkspaceId,
    selectTogglUserGroupInclusionsByWorkspaceId,
    selectTogglUserInclusionsByWorkspaceId,
  ],
  (...args): Record<string, Record<EntityGroup, EntityModel[]>> =>
    getEntityGroupRecordsByWorkspaceId(...args),
);

export const selectTogglEntitiesByWorkspaceId = createSelector(
  [
    selectTogglWorkspaceIds,
    selectTogglClientsByWorkspaceId,
    selectTogglProjectsByWorkspaceId,
    selectTogglTagsByWorkspaceId,
    selectTogglTasksByWorkspaceId,
    selectTogglTimeEntriesByWorkspaceId,
    selectTogglUserGroupsByWorkspaceId,
    selectTogglUsersByWorkspaceId,
  ],
  (...args): Record<string, Record<EntityGroup, EntityModel[]>> =>
    getEntityGroupRecordsByWorkspaceId(...args),
);
