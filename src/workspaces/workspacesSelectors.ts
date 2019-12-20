import { createSelector, Selector } from "reselect";
import { get, isNil } from "lodash";
import { selectTogglClientsByWorkspaceFactory } from "~/clients/clientsSelectors";
import { selectTogglProjectsByWorkspaceFactory } from "~/projects/projectsSelectors";
import { selectTogglTagsByWorkspaceFactory } from "~/tags/tagsSelectors";
import { selectToggleTasksByWorkspaceFactory } from "~/tasks/tasksSelectors";
import { selectTimeEntriesByWorkspaceFactory } from "~/timeEntries/timeEntriesSelectors";
import { selectTogglUserGroupsByWorkspaceFactory } from "~/userGroups/userGroupsSelectors";
import { selectTogglUsersByWorkspaceFactory } from "~/users/usersSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import {
  CompoundWorkspaceModel,
  CountsByGroupByWorkspaceModel,
  EntitiesByGroupByWorkspaceModel,
  RecordCountsModel,
} from "~/workspaces/workspacesTypes";
import { CompoundEntityModel, EntityGroup, ToolName } from "~/commonTypes";

const selectClockifyWorkspacesById = createSelector(
  (state: ReduxState) => state.workspaces.clockify.byId,
  (workspacesById): Record<string, CompoundWorkspaceModel> => workspacesById,
);

export const selectIfWorkspacesFetching = (state: ReduxState): boolean =>
  state.workspaces.isFetching;

export const selectTogglWorkspaceIds = createSelector(
  (state: ReduxState) => state.workspaces.toggl.idValues,
  (workspaceIds): Array<string> => workspaceIds,
);

export const selectTogglWorkspacesById = createSelector(
  (state: ReduxState) => state.workspaces.toggl.byId,
  (workspacesById): Record<string, CompoundWorkspaceModel> => workspacesById,
);

export const selectTogglWorkspaces = createSelector(
  selectTogglWorkspacesById,
  (workspacesById): Array<CompoundWorkspaceModel> =>
    Object.values(workspacesById),
);

export const selectTogglIncludedWorkspacesById = createSelector(
  selectTogglWorkspacesById,
  (workspacesById): Record<string, CompoundWorkspaceModel> =>
    Object.entries(workspacesById).reduce(
      (acc, [workspaceId, workspaceRecord]) => {
        if (!workspaceRecord.isIncluded) {
          return acc;
        }

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
  (workspacesById): Array<CompoundWorkspaceModel> =>
    Object.values(workspacesById),
);

const selectTogglIncludedWorkspacesByName = createSelector(
  selectTogglIncludedWorkspaces,
  (includedWorkspaces): Record<string, CompoundWorkspaceModel> =>
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
  (workspacesByName): Array<string> => Object.keys(workspacesByName),
);

export const selectClockifyIncludedWorkspacesById = createSelector(
  selectClockifyWorkspacesById,
  selectTogglIncludedWorkspacesByName,
  (clockifyWorkspacesById, togglWorkspacesByName) =>
    Object.entries(clockifyWorkspacesById).reduce(
      (acc, [workspaceId, workspaceRecord]) => {
        if (isNil(togglWorkspacesByName[workspaceRecord.name])) {
          return acc;
        }

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
  (_: unknown, clockifyWorkspaceId: string) => clockifyWorkspaceId,
  (
    togglWorkspacesById,
    clockifyWorkspacesById,
    clockifyWorkspaceId,
  ): Array<number> => {
    const { linkedId } = get(clockifyWorkspacesById, clockifyWorkspaceId, {
      linkedId: null,
    });
    if (isNil(linkedId)) {
      return [];
    }

    const { inclusionsByYear } = get(togglWorkspacesById, linkedId, {
      inclusionsByYear: null,
    });
    if (isNil(inclusionsByYear)) {
      return [];
    }

    return Object.entries(inclusionsByYear).reduce(
      (acc, [year, isIncluded]) => {
        if (!isIncluded) {
          return acc;
        }
        return [...acc, year];
      },
      [],
    );
  },
);

export const selectWorkspaceNameBeingFetched = createSelector(
  (state: ReduxState) => state.workspaces.workspaceNameBeingFetched,
  (workspaceNameBeingFetched): string => workspaceNameBeingFetched,
);

export const selectTogglEntitiesByGroupByWorkspace = createSelector(
  selectTogglEntitiesByGroupByWorkspaceFactory(false),
  togglAllEntitiesByGroupByWorkspace => togglAllEntitiesByGroupByWorkspace,
);

export const selectTogglCountsByGroupByWorkspace = createSelector(
  selectTogglEntitiesByGroupByWorkspaceFactory(false),
  (entitiesByGroupByWorkspace): CountsByGroupByWorkspaceModel =>
    Object.entries(entitiesByGroupByWorkspace).reduce(
      (acc, [workspaceId, entitiesByGroup]) => ({
        ...acc,
        [workspaceId]: calculateRecordCountsByEntityGroup(entitiesByGroup),
      }),
      {},
    ),
);

export const selectCountTotalOfTransfersInWorkspace = createSelector(
  selectTogglEntitiesByGroupByWorkspaceFactory(true),
  entitiesByGroupByWorkspace => (workspaceIdToGet: string): number => {
    const workspaceEntitiesByGroup = get(
      entitiesByGroupByWorkspace,
      workspaceIdToGet,
      null,
    );
    if (isNil(workspaceEntitiesByGroup)) {
      return 0;
    }

    const countsByEntityGroup = calculateRecordCountsByEntityGroup(
      workspaceEntitiesByGroup,
    );

    const entityGroupsToInclude = [
      EntityGroup.Projects,
      EntityGroup.Clients,
      EntityGroup.Tags,
      EntityGroup.Tasks,
      EntityGroup.TimeEntries,
    ];

    let totalCount = 0;

    entityGroupsToInclude.forEach(entityGroup => {
      const { includedRecordCount } = get(countsByEntityGroup, entityGroup, {
        includedRecordCount: 0,
      });
      totalCount += includedRecordCount;
    });

    return totalCount;
  },
);

export const selectCountTotalOfTransfersOverall = createSelector(
  selectCountTotalOfTransfersInWorkspace,
  selectTogglWorkspaceIds,
  (getTotalCountOfPendingTransfers, workspaceIds) =>
    workspaceIds.reduce((acc, workspaceId) => {
      const totalCount = getTotalCountOfPendingTransfers(workspaceId);
      return acc + totalCount;
    }, 0),
);

function selectTogglEntitiesByGroupByWorkspaceFactory(
  inclusionsOnly: boolean,
): Selector<ReduxState, EntitiesByGroupByWorkspaceModel> {
  return createSelector(
    selectTogglWorkspaceIds,
    selectTogglClientsByWorkspaceFactory(inclusionsOnly),
    selectTogglProjectsByWorkspaceFactory(inclusionsOnly),
    selectTogglTagsByWorkspaceFactory(inclusionsOnly),
    selectToggleTasksByWorkspaceFactory(inclusionsOnly),
    selectTimeEntriesByWorkspaceFactory(ToolName.Toggl, inclusionsOnly),
    selectTogglUserGroupsByWorkspaceFactory(inclusionsOnly),
    selectTogglUsersByWorkspaceFactory(inclusionsOnly),
    (
      workspaceIds: Array<string>,
      clientsByWorkspace: Record<string, Array<CompoundEntityModel>>,
      projectsByWorkspace: Record<string, Array<CompoundEntityModel>>,
      tagsByWorkspace: Record<string, Array<CompoundEntityModel>>,
      tasksByWorkspace: Record<string, Array<CompoundEntityModel>>,
      timeEntriesByWorkspace: Record<string, Array<CompoundEntityModel>>,
      userGroupsByWorkspace: Record<string, Array<CompoundEntityModel>>,
      usersByWorkspace: Record<string, Array<CompoundEntityModel>>,
    ): EntitiesByGroupByWorkspaceModel =>
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
}

function calculateRecordCountsByEntityGroup(
  entitiesByGroup: Record<EntityGroup, Array<CompoundEntityModel>>,
): Record<EntityGroup, RecordCountsModel> {
  const totalEntryCount = entitiesByGroup[EntityGroup.TimeEntries].length;

  return Object.entries(entitiesByGroup).reduce(
    (acc, [entityGroup, entityRecords]) => {
      const totalRecordCount = entityRecords.length;
      let includedRecordCount = 0;
      let includedEntryCount = 0;

      entityRecords.forEach(entityRecord => {
        if (entityRecord.isIncluded && isNil(entityRecord.linkedId)) {
          includedRecordCount += 1;
          includedEntryCount += get(entityRecord, "entryCount", 0);
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
}
