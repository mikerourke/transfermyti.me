import { createSelector } from 'reselect';
import {
  WorkspaceAndYearModel,
  WorkspaceModel,
} from '../../../types/workspacesTypes';
import { State } from '../../rootReducer';

export const selectTogglWorkspacesById = createSelector(
  (state: State) => state.entities.workspaces.toggl.workspacesById,
  (workspacesById): Record<string, WorkspaceModel> => workspacesById,
);

export const selectTogglWorkspaceRecords = createSelector(
  selectTogglWorkspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const selectTogglIncludedWorkspaceRecords = createSelector(
  selectTogglWorkspaceRecords,
  (workspaceRecords): WorkspaceModel[] =>
    workspaceRecords.filter(({ isIncluded }) => isIncluded),
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

export const selectTogglWorkspaceAndYearRecords = createSelector(
  selectTogglIncludedWorkspaceRecords,
  (workspaceRecords): WorkspaceAndYearModel[] => {
    const workspaceAndYearRecords: WorkspaceAndYearModel[] = [];

    workspaceRecords.forEach(({ id, inclusionsByYear }) => {
      Object.entries(inclusionsByYear).forEach(([year, isIncluded]) => {
        if (isIncluded) {
          workspaceAndYearRecords.push({ id, year: +year });
        }
      });
    });

    return workspaceAndYearRecords;
  },
);

export const selectTogglWorkspaceIds = createSelector(
  (state: State) => state.entities.workspaces.toggl.workspaceIds,
  (workspaceIds): string[] => workspaceIds,
);

export const selectTogglIncludedWorkspaceIds = createSelector(
  selectTogglIncludedWorkspaceRecords,
  (workspaceRecords): string[] => workspaceRecords.map(({ id }) => id),
);
