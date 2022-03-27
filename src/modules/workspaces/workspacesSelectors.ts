import { compose, isNil, prop, sortBy, toLower } from "ramda";
import { createSelector, createStructuredSelector } from "reselect";

import { selectIdToLinkedId } from "~/entityOperations/selectIdToLinkedId";
import type { Mapping, ReduxState, Workspace } from "~/typeDefs";

export const areWorkspacesFetchingSelector = createSelector(
  (state: ReduxState) => state.workspaces.isFetching,
  (isFetching): boolean => isFetching,
);

export const activeWorkspaceIdSelector = createSelector(
  (state: ReduxState) => state.workspaces.activeWorkspaceId,
  (activeWorkspaceId): string => activeWorkspaceId,
);

export const sourceWorkspacesByIdSelector = createSelector(
  (state: ReduxState): Dictionary<Workspace> => state.workspaces.source,
  (workspacesById): Dictionary<Workspace> => workspacesById,
);

export const sourceWorkspacesSelector = createSelector(
  sourceWorkspacesByIdSelector,
  (workspacesById): Workspace[] => {
    const workspaces = Object.values(workspacesById);

    return sortBy(compose(toLower, prop("name")), workspaces);
  },
);

export const firstIncludedWorkspaceIdSelector = createSelector(
  sourceWorkspacesSelector,
  (sourceWorkspaces): string => {
    const firstIncluded = sourceWorkspaces.find(
      (sourceWorkspace) => sourceWorkspace.isIncluded,
    );

    if (firstIncluded === undefined) {
      return "";
    }

    return firstIncluded.id;
  },
);

export const targetWorkspacesByIdSelector = createSelector(
  (state: ReduxState): Dictionary<Workspace> => state.workspaces.target,
  (workspacesById): Dictionary<Workspace> => workspacesById,
);

export const includedSourceWorkspacesSelector = createSelector(
  sourceWorkspacesSelector,
  (workspaces): Workspace[] =>
    workspaces.filter((workspace) => workspace.isIncluded),
);

export const sourceIncludedWorkspacesCountSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedWorkspaces): number => includedWorkspaces.length,
);

export const sourceWorkspacesForTransferSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedWorkspaces): Workspace[] =>
    includedWorkspaces.filter((workspace) => isNil(workspace.linkedId)),
);

export const workspaceIdToLinkedIdSelector = createSelector(
  sourceWorkspacesByIdSelector,
  (sourceWorkspacesById): Dictionary<string> =>
    selectIdToLinkedId(sourceWorkspacesById),
);

export const targetWorkspacesSelector = createSelector(
  targetWorkspacesByIdSelector,
  (workspacesById): Workspace[] => {
    const workspaces = Object.values(workspacesById);

    return sortBy(compose(toLower, prop("name")), workspaces);
  },
);

export const missingTargetWorkspacesSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedSourceWorkspaces): Workspace[] =>
    includedSourceWorkspaces.filter(({ linkedId }) => linkedId === null),
);

export const hasDuplicateTargetWorkspacesSelector = createSelector(
  includedSourceWorkspacesSelector,
  (includedSourceWorkspaces): boolean => {
    const countByLinkedId: Dictionary<number> = {};

    for (const { linkedId } of includedSourceWorkspaces) {
      if (linkedId === null) {
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

const limitIdsToIncluded = (workspaces: Workspace[]): string[] => {
  const includedIds: string[] = [];

  for (const workspace of workspaces) {
    if (workspace.isIncluded) {
      includedIds.push(workspace.id);
    }
  }

  return includedIds;
};

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
