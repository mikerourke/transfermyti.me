import { createSelector, createStructuredSelector } from "reselect";

import * as R from "ramda";

import { selectIdToLinkedId } from "~/entityOperations/selectIdToLinkedId";
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
  (workspacesById): WorkspaceModel[] => {
    const workspaces = Object.values(workspacesById);
    return R.sortBy(R.compose(R.toLower, R.prop("name")), workspaces);
  },
);

export const firstIncludedWorkspaceIdSelector = createSelector(
  sourceWorkspacesSelector,
  (sourceWorkspaces): string => {
    const firstIncluded = sourceWorkspaces.find(
      (sourceWorkspace) => sourceWorkspace.isIncluded,
    );

    if (!firstIncluded) {
      return "";
    }

    return firstIncluded.id;
  },
);

export const targetWorkspacesByIdSelector = createSelector(
  (state: ReduxState): WorkspacesByIdModel => state.workspaces.target,
  (workspacesById): WorkspacesByIdModel => workspacesById,
);

export const includedSourceWorkspacesSelector = createSelector(
  sourceWorkspacesSelector,
  (workspaces): WorkspaceModel[] =>
    workspaces.filter((workspace) => workspace.isIncluded),
);

export const sourceIncludedWorkspacesCountSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedWorkspaces): number => includedWorkspaces.length,
);

export const sourceWorkspacesForTransferSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedWorkspaces): WorkspaceModel[] =>
    includedWorkspaces.filter((workspace) => R.isNil(workspace.linkedId)),
);

export const workspaceIdToLinkedIdSelector = createSelector(
  sourceWorkspacesByIdSelector,
  (sourceWorkspacesById): Record<string, string> =>
    selectIdToLinkedId(sourceWorkspacesById),
);

export const targetWorkspacesSelector = createSelector(
  targetWorkspacesByIdSelector,
  (workspacesById): WorkspaceModel[] => {
    const workspaces = Object.values(workspacesById);
    return R.sortBy(R.compose(R.toLower, R.prop("name")), workspaces);
  },
);

export const missingTargetWorkspacesSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedSourceWorkspaces): WorkspaceModel[] =>
    includedSourceWorkspaces.filter(({ linkedId }) => linkedId === null),
);

export const hasDuplicateTargetWorkspacesSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedSourceWorkspaces): boolean => {
    const countByLinkedId: Record<string, number> = {};

    for (const { linkedId } of includedSourceWorkspaces) {
      if (!linkedId) {
        continue;
      }

      if (linkedId in countByLinkedId) {
        countByLinkedId[linkedId] += 1;
      } else {
        countByLinkedId[linkedId] = 1;
      }
    }

    return Object.values(countByLinkedId).some((count) => count > 1);
  },
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
