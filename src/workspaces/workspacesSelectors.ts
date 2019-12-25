import { createSelector } from "reselect";
import { Mapping } from "~/common/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  WorkspaceModel,
  WorkspacesByIdModel,
} from "~/workspaces/workspacesTypes";

export const selectIfWorkspacesFetching = (state: ReduxState): boolean =>
  state.workspaces.isFetching;

export const selectActiveWorkspaceId = (state: ReduxState): string =>
  state.workspaces.activeWorkspaceId;

const selectSourceWorkspacesById = createSelector(
  (state: ReduxState): WorkspacesByIdModel => state.workspaces.source,
  workspacesById => workspacesById,
);

const selectTargetWorkspacesById = createSelector(
  (state: ReduxState): WorkspacesByIdModel => state.workspaces.target,
  workspacesById => workspacesById,
);

export const selectSourceWorkspaces = createSelector(
  selectSourceWorkspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const selectTargetWorkspaces = createSelector(
  selectTargetWorkspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

const limitIdsToIncluded = (workspaces: WorkspaceModel[]): string[] =>
  workspaces.reduce((acc, workspace) => {
    if (!workspace.isIncluded) {
      return acc;
    }
    return [...acc, workspace.id];
  }, [] as string[]);

export const selectInlcudedWorkspaceIdsByMapping = createSelector(
  selectSourceWorkspaces,
  selectTargetWorkspaces,
  (sourceWorkspaces, targetWorkspaces): Record<Mapping, string[]> => ({
    source: limitIdsToIncluded(sourceWorkspaces),
    target: limitIdsToIncluded(targetWorkspaces),
  }),
);

export const selectSourceIncludedWorkspacesCount = createSelector(
  selectSourceWorkspaces,
  (workspaces): number =>
    workspaces.filter(workspace => workspace.isIncluded).length,
);

export const selectTargetWorkspacesForTransfer = createSelector(
  selectTargetWorkspaces,
  targetWorkspaces =>
    targetWorkspaces.filter(workspace => workspace.isIncluded),
);
