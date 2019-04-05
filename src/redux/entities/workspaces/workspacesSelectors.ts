import { createSelector } from 'reselect';
import { get, isEmpty, isNil } from 'lodash';
import {
  selectClockifyClientsByWorkspace,
  selectTogglClientsByWorkspaceFactory,
} from '~/redux/entities/clients/clientsSelectors';
import {
  selectClockifyProjectsByWorkspace,
  selectTogglProjectsByWorkspaceFactory,
} from '~/redux/entities/projects/projectsSelectors';
import {
  selectClockifyTagsByWorkspace,
  selectTogglTagsByWorkspaceFactory,
} from '~/redux/entities/tags/tagsSelectors';
import {
  selectClockifyTasksByWorkspace,
  selectToggleTasksByWorkspaceFactory,
} from '~/redux/entities/tasks/tasksSelectors';
import {
  selectTimeEntriesByWorkspaceFactory,
} from '~/redux/entities/timeEntries/timeEntriesSelectors';
import {
  selectClockifyUserGroupsByWorkspace,
  selectTogglUserGroupsByWorkspaceFactory,
} from '~/redux/entities/userGroups/userGroupsSelectors';
import {
  selectClockifyUsersByWorkspace,
  selectTogglUsersByWorkspaceFactory,
} from '~/redux/entities/users/usersSelectors';
import { EntityModel, ReduxState, ToolName } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';
import {
  CountsByGroupByWorkspaceModel,
  EntitiesByGroupByWorkspaceModel,
  RecordCountsModel,
  WorkspaceModel,
} from '~/types/workspacesTypes';

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

const getEntitiesByGroupByWorkspace = (
  workspaceIds: string[],
  clientsByWorkspace: Record<string, EntityModel[]>,
  projectsByWorkspace: Record<string, EntityModel[]>,
  tagsByWorkspace: Record<string, EntityModel[]>,
  tasksByWorkspace: Record<string, EntityModel[]>,
  timeEntriesByWorkspace: Record<string, EntityModel[]>,
  userGroupsByWorkspace: Record<string, EntityModel[]>,
  usersByWorkspace: Record<string, EntityModel[]>,
): EntitiesByGroupByWorkspaceModel =>
  workspaceIds.reduce(
    (acc, workspaceId) => ({
      ...acc,
      [workspaceId.toString()]: {
        [EntityGroup.Clients]: get(clientsByWorkspace, workspaceId, []),
        [EntityGroup.Projects]: get(projectsByWorkspace, workspaceId, []),
        [EntityGroup.Tags]: get(tagsByWorkspace, workspaceId, []),
        [EntityGroup.Tasks]: get(tasksByWorkspace, workspaceId, []),
        [EntityGroup.TimeEntries]: get(timeEntriesByWorkspace, workspaceId, []),
        [EntityGroup.UserGroups]: get(userGroupsByWorkspace, workspaceId, []),
        [EntityGroup.Users]: get(usersByWorkspace, workspaceId, []),
      },
    }),
    {},
  );

const selectClockifyEntitiesByGroupByWorkspace = createSelector(
  selectClockifyIncludedWorkspacesById,
  selectClockifyClientsByWorkspace,
  selectClockifyProjectsByWorkspace,
  selectClockifyTagsByWorkspace,
  selectClockifyTasksByWorkspace,
  selectTimeEntriesByWorkspaceFactory(ToolName.Toggl, false),
  selectClockifyUserGroupsByWorkspace,
  selectClockifyUsersByWorkspace,
  (includedWorkspacesById, ...args): EntitiesByGroupByWorkspaceModel => {
    const workspaceIds = Object.keys(includedWorkspacesById);
    return getEntitiesByGroupByWorkspace(workspaceIds, ...args);
  },
);

const selectTogglEntitiesByGroupByWorkspaceFactory = (
  inclusionsOnly: boolean,
) =>
  createSelector(
    selectTogglWorkspaceIds,
    selectTogglClientsByWorkspaceFactory(inclusionsOnly),
    selectTogglProjectsByWorkspaceFactory(inclusionsOnly),
    selectTogglTagsByWorkspaceFactory(inclusionsOnly),
    selectToggleTasksByWorkspaceFactory(inclusionsOnly),
    selectTimeEntriesByWorkspaceFactory(ToolName.Toggl, inclusionsOnly),
    selectTogglUserGroupsByWorkspaceFactory(inclusionsOnly),
    selectTogglUsersByWorkspaceFactory(inclusionsOnly),
    (...args): EntitiesByGroupByWorkspaceModel =>
      getEntitiesByGroupByWorkspace(...args),
  );

export const selectTogglIncludedByGroupByWorkspace = createSelector(
  selectTogglEntitiesByGroupByWorkspaceFactory(true),
  togglInclusionsByGroupByWorkspace => togglInclusionsByGroupByWorkspace,
);

export const selectTogglEntitiesByGroupByWorkspace = createSelector(
  selectTogglEntitiesByGroupByWorkspaceFactory(false),
  togglAllEntitiesByGroupByWorkspace => togglAllEntitiesByGroupByWorkspace,
);

const getByGroupByWorkspaceSelectorForTool = (toolName: ToolName) =>
  ({
    [ToolName.Clockify]: selectClockifyEntitiesByGroupByWorkspace,
    [ToolName.Toggl]: selectTogglEntitiesByGroupByWorkspaceFactory(false),
  }[toolName]);

const calculateRecordCountsByEntityGroup = (
  entitiesByGroup: Record<EntityGroup, EntityModel[]>,
): Record<EntityGroup, RecordCountsModel> => {
  const totalEntryCount = entitiesByGroup[EntityGroup.TimeEntries].length;

  return Object.entries(entitiesByGroup).reduce(
    (acc, [entityGroup, entityRecords]) => {
      const totalRecordCount = entityRecords.length;
      let includedRecordCount = 0;
      let includedEntryCount = 0;

      entityRecords.forEach(entityRecord => {
        if (entityRecord.isIncluded) {
          includedRecordCount += 1;
          includedEntryCount += get(entityRecord, 'entryCount', 0);
        }
      });

      return {
        ...acc,
        [entityGroup]: {
          includedRecordCount,
          totalRecordCount,
          includedEntryCount,
          totalEntryCount,
        },
      };
    },
    {} as Record<EntityGroup, RecordCountsModel>,
  );
};

const selectRecordCountsByGroupByWorkspaceFactory = (toolName: ToolName) =>
  createSelector(
    getByGroupByWorkspaceSelectorForTool(toolName),
    entitiesByGroupByWorkspace =>
      Object.entries(entitiesByGroupByWorkspace).reduce(
        (acc, [workspaceId, entitiesByGroup]) => ({
          ...acc,
          [workspaceId]: calculateRecordCountsByEntityGroup(entitiesByGroup),
        }),
        {},
      ),
  );

export const selectClockifyCountsByGroupByWorkspace = createSelector(
  selectRecordCountsByGroupByWorkspaceFactory(ToolName.Clockify),
  (countsByEntityGroupByWorkspace): CountsByGroupByWorkspaceModel =>
    countsByEntityGroupByWorkspace,
);

export const selectTogglCountsByGroupByWorkspace = createSelector(
  selectRecordCountsByGroupByWorkspaceFactory(ToolName.Toggl),
  (countsByEntityGroupByWorkspace): CountsByGroupByWorkspaceModel =>
    countsByEntityGroupByWorkspace,
);
