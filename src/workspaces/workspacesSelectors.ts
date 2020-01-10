import { createSelector, createStructuredSelector } from "reselect";
import * as R from "ramda";
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
  workspacesById => workspacesById,
);

export const targetWorkspacesByIdSelector = createSelector(
  (state: ReduxState): WorkspacesByIdModel => state.workspaces.target,
  workspacesById => workspacesById,
);

export const workspaceIdToLinkedIdSelector = createSelector(
  sourceWorkspacesByIdSelector,
  sourceWorkspacesById => {
    const workspaceIdToLinkedId: Record<string, string> = {};

    for (const [id, workspace] of Object.entries(sourceWorkspacesById)) {
      if (!R.isNil(workspace.linkedId)) {
        workspaceIdToLinkedId[id] = workspace.linkedId;
        workspaceIdToLinkedId[workspace.linkedId] = workspace.id;
      }
    }

    return workspaceIdToLinkedId;
  },
);

export const sourceWorkspacesSelector = createSelector(
  sourceWorkspacesByIdSelector,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const includedSourceWorkspacesSelector = createSelector(
  sourceWorkspacesSelector,
  (workspaces): WorkspaceModel[] =>
    workspaces.filter(workspace => workspace.isIncluded),
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

export const sourceIncludedWorkspacesCountSelector = createSelector(
  sourceWorkspacesSelector,
  (workspaces): number =>
    workspaces.filter(workspace => workspace.isIncluded).length,
);

export const sourceWorkspacesForTransferSelector = createSelector(
  sourceWorkspacesSelector,
  sourceWorkspaces =>
    sourceWorkspaces.filter(workspace => workspace.isIncluded),
);
