import { createSelector } from 'reselect';
import { get, isEmpty, isNil } from 'lodash';
import { selectTogglClientsByWorkspaceFactory } from '~/redux/entities/clients/clientsSelectors';
import { selectTogglProjectsByWorkspaceFactory } from '~/redux/entities/projects/projectsSelectors';
import { selectTogglTagsByWorkspaceFactory } from '~/redux/entities/tags/tagsSelectors';
import { selectToggleTasksByWorkspaceFactory } from '~/redux/entities/tasks/tasksSelectors';
import { selectTogglTimeEntriesByWorkspaceFactory } from '~/redux/entities/timeEntries/timeEntriesSelectors';
import { selectTogglUserGroupsByWorkspaceFactory } from '~/redux/entities/userGroups/userGroupsSelectors';
import { selectTogglUsersByWorkspaceFactory } from '~/redux/entities/users/usersSelectors';
import { EntityModel, ReduxState } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';
import { WorkspaceModel } from '~/types/workspacesTypes';

export const selectTogglWorkspaceIds = createSelector(
  (state: ReduxState) => state.entities.workspaces.toggl.idValues,
  (workspaceIds): string[] => workspaceIds,
);

const selectClockifyWorkspacesById = createSelector(
  (state: ReduxState) => state.entities.workspaces.clockify.byId,
  (workspacesById): Record<string, WorkspaceModel> => workspacesById,
);

export const selectTogglWorkspacesById = createSelector(
  (state: ReduxState) => state.entities.workspaces.toggl.byId,
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

export const selectTogglIncludedWorkspaces = createSelector(
  selectTogglIncludedWorkspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

const selectTogglIncludedWorkspacesByName = createSelector(
  selectTogglIncludedWorkspaces,
  (includedWorkspaces): Record<string, WorkspaceModel> =>
    includedWorkspaces.reduce(
      (acc, workspace) => ({
        ...acc,
        [workspace.name]: workspace,
      }),
      {},
    ),
);

export const selectTogglIncludedWorkspaceNames = createSelector(
  selectTogglIncludedWorkspacesByName,
  (workspacesByName): string[] => Object.keys(workspacesByName),
);

export const selectClockifyIncludedWorkspacesById = createSelector(
  selectClockifyWorkspacesById,
  selectTogglIncludedWorkspacesByName,
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
  selectTogglIncludedWorkspaces,
  (workspaces): number => workspaces.length,
);

export const selectTogglWorkspaceIncludedYears = createSelector(
  selectTogglWorkspacesById,
  selectClockifyWorkspacesById,
  (_: any, clockifyWorkspaceId: string) => clockifyWorkspaceId,
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
  selectTogglWorkspacesById,
  selectTogglWorkspaceIds,
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
  (state: ReduxState) => state.entities.workspaces.workspaceNameBeingFetched,
  (workspaceNameBeingFetched): string => workspaceNameBeingFetched,
);

const selectTogglEntitiesByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglWorkspaceIds,
    selectTogglClientsByWorkspaceFactory(inclusionsOnly),
    selectTogglProjectsByWorkspaceFactory(inclusionsOnly),
    selectTogglTagsByWorkspaceFactory(inclusionsOnly),
    selectToggleTasksByWorkspaceFactory(inclusionsOnly),
    selectTogglTimeEntriesByWorkspaceFactory(inclusionsOnly),
    selectTogglUserGroupsByWorkspaceFactory(inclusionsOnly),
    selectTogglUsersByWorkspaceFactory(inclusionsOnly),
    (
      workspaceIds: string[],
      clientsByWorkspace: Record<string, EntityModel[]>,
      projectsByWorkspace: Record<string, EntityModel[]>,
      tagsByWorkspace: Record<string, EntityModel[]>,
      tasksByWorkspace: Record<string, EntityModel[]>,
      timeEntriesByWorkspace: Record<string, EntityModel[]>,
      userGroupsByWorkspace: Record<string, EntityModel[]>,
      usersByWorkspace: Record<string, EntityModel[]>,
    ): Record<string, Record<EntityGroup, EntityModel[]>> =>
      workspaceIds.reduce(
        (acc, workspaceId) => ({
          ...acc,
          [workspaceId.toString()]: {
            [EntityGroup.Clients]: get(clientsByWorkspace, workspaceId, []),
            [EntityGroup.Projects]: get(projectsByWorkspace, workspaceId, []),
            [EntityGroup.Tags]: get(tagsByWorkspace, workspaceId, []),
            [EntityGroup.Tasks]: get(tasksByWorkspace, workspaceId, []),
            [EntityGroup.TimeEntries]: get(
              timeEntriesByWorkspace,
              workspaceId,
              [],
            ),
            [EntityGroup.UserGroups]: get(
              userGroupsByWorkspace,
              workspaceId,
              [],
            ),
            [EntityGroup.Users]: get(usersByWorkspace, workspaceId, []),
          },
        }),
        {},
      ),
  );

export const selectTogglInclusionsByWorkspaceId = createSelector(
  selectTogglEntitiesByWorkspaceFactory(true),
  togglInclusionsByWorkspaceId => togglInclusionsByWorkspaceId,
);

export const selectTogglAllEntitiesByWorkspaceId = createSelector(
  selectTogglEntitiesByWorkspaceFactory(false),
  togglAllEntitiesByWorkspaceId => togglAllEntitiesByWorkspaceId,
);
