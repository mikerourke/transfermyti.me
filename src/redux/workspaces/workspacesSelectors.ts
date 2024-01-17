import { compose, isNil, prop, sortBy, toLower } from "ramda";

import { selectIdToLinkedId } from "~/api/selectIdToLinkedId";
import { createSelector } from "~/redux/reduxTools";
import type { Mapping, ReduxState, Workspace } from "~/types";

export const areWorkspacesFetchingSelector = (state: ReduxState): boolean =>
  state.workspaces.isFetching;

export const activeWorkspaceIdSelector = (state: ReduxState): string =>
  state.workspaces.activeWorkspaceId;

export const sourceWorkspacesByIdSelector = (
  state: ReduxState,
): Dictionary<Workspace> => state.workspaces.source;

export const targetWorkspacesByIdSelector = (
  state: ReduxState,
): Dictionary<Workspace> => state.workspaces.target;

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

export const includedWorkspaceIdsByMappingSelector = createSelector(
  includedSourceWorkspaceIdsSelector,
  includedTargetWorkspaceIdsSelector,
  (
    includedSourceWorkspaceIds,
    includedTargetWorkspaceIds,
  ): Record<Mapping, string[]> => ({
    source: includedSourceWorkspaceIds,
    target: includedTargetWorkspaceIds,
  }),
);
