import { createSelector, createStructuredSelector } from "reselect";
import { selectIdToLinkedId } from "~/redux/reduxUtils";
import {
  Mapping,
  ReduxState,
  WorkspaceModel,
  WorkspacesByIdModel,
} from "~/typeDefs";

export const areWorkspacesFetchingSelector = (state: ReduxState): boolean =>
  state.workspaces.isFetching;

export const activeWorkspaceIdSelector = (state: ReduxState): string =>
  state.workspaces.activeWorkspaceId;

export const sourceWorkspacesByIdSelector = createSelector(
  (state: ReduxState): WorkspacesByIdModel => state.workspaces.source,
  (workspacesById): WorkspacesByIdModel => workspacesById,
);

export const sourceWorkspacesSelector = createSelector(
  sourceWorkspacesByIdSelector,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const targetWorkspacesByIdSelector = createSelector(
  (state: ReduxState): WorkspacesByIdModel => state.workspaces.target,
  (workspacesById): WorkspacesByIdModel => workspacesById,
);

export const includedSourceWorkspacesSelector = createSelector(
  sourceWorkspacesSelector,
  (workspaces): WorkspaceModel[] =>
    workspaces.filter(workspace => workspace.isIncluded),
);

export const sourceIncludedWorkspacesCountSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedWorkspaces): number => includedWorkspaces.length,
);

export const sourceWorkspacesForTransferSelector = createSelector(
  sourceWorkspacesSelector,
  (sourceWorkspaces): WorkspaceModel[] =>
    sourceWorkspaces.filter(workspace => workspace.isIncluded),
);

export const workspaceIdToLinkedIdSelector = createSelector(
  sourceWorkspacesByIdSelector,
  (sourceWorkspacesById): Record<string, string> =>
    selectIdToLinkedId(sourceWorkspacesById),
);

const targetWorkspacesSelector = createSelector(
  targetWorkspacesByIdSelector,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const missingTargetWorkspacesSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedSourceWorkspaces): WorkspaceModel[] =>
    includedSourceWorkspaces.filter(({ linkedId }) => linkedId === null),
);

const limitIdsToIncluded = (workspaces: WorkspaceModel[]): string[] =>
  workspaces.reduce((acc, workspace) => {
    if (!workspace.isIncluded) {
      return acc;
    }
    return [...acc, workspace.id];
  }, [] as string[]);

export const includedSourceWorkspaceIdsSelector = createSelector(
  sourceWorkspacesSelector,
  limitIdsToIncluded,
);

const includedTargetWorkspaceIdsSelector = createSelector(
  targetWorkspacesSelector,
  limitIdsToIncluded,
);

export const includedWorkspaceIdsByMappingSelector = createStructuredSelector<
  ReduxState,
  Record<Mapping, string[]>
>({
  source: includedSourceWorkspaceIdsSelector,
  target: includedTargetWorkspaceIdsSelector,
});
