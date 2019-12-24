import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

export const selectIfWorkspacesFetching = (state: ReduxState): boolean =>
  state.workspaces.isFetching;

export const selectSourceWorkspaces = createSelector(
  (state: ReduxState) => state.workspaces.source,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const selectSourceIncludedWorkspacesCount = createSelector(
  selectSourceWorkspaces,
  (workspaces): number =>
    workspaces.filter(workspace => workspace.isIncluded).length,
);

export const selectTargetWorkspacesById = createSelector(
  (state: ReduxState) => state.workspaces.target,
  (workspacesById): Record<string, WorkspaceModel> => workspacesById,
);

export const selectTargetWorkspaces = createSelector(
  selectTargetWorkspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const selectTargetWorkspacesForTransfer = createSelector(
  selectTargetWorkspaces,
  targetWorkspaces =>
    targetWorkspaces.filter(workspace => workspace.isIncluded),
);
