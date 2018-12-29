import { createSelector } from 'reselect';
import { selectTogglClientRecords } from '../clients/clientsSelectors';
import { selectTogglProjectRecords } from '../projects/projectsSelectors';
import { selectTogglTagRecords } from '../tags/tagsSelectors';
import { selectTogglTaskRecords } from '../tasks/tasksSelectors';
import { selectTogglTimeEntryRecords } from '../timeEntries/timeEntriesSelectors';
import { selectTogglUserGroupRecords } from '../userGroups/userGroupsSelectors';
import {
  WorkspaceEntitiesFetchDetailsModel,
  WorkspaceEntitiesModel,
  WorkspaceModel,
} from '../../../types/workspacesTypes';
import { State } from '../../rootReducer';

export const selectTogglWorkspacesById = createSelector(
  (state: State) => state.entities.workspaces.toggl.workspacesById,
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

export const selectWorkspaceEntitiesFetchDetails = createSelector(
  (state: State) => state.entities.workspaces.entitiesFetchDetails,
  (entitiesFetchDetails): WorkspaceEntitiesFetchDetailsModel =>
    entitiesFetchDetails,
);

export const selectTogglWorkspaceEntities = createSelector(
  [
    selectTogglClientRecords,
    selectTogglProjectRecords,
    selectTogglTagRecords,
    selectTogglTaskRecords,
    selectTogglTimeEntryRecords,
    selectTogglUserGroupRecords,
  ],
  (
    clients,
    projects,
    tags,
    tasks,
    timeEntries,
    userGroups,
  ): WorkspaceEntitiesModel => ({
    clients,
    projects,
    tags,
    tasks,
    timeEntries,
    userGroups,
  }),
);
