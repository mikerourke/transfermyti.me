import { compose, isNil, prop, sortBy, toLower } from "ramda";
import { createSelector, createStructuredSelector } from "reselect";

import { selectIdToLinkedId } from "~/entityOperations/selectIdToLinkedId";
import type { Mapping, ReduxState, Workspace } from "~/typeDefs";

export const areWorkspacesFetchingSelector = (state: ReduxState): boolean =>
  state.workspaces.isFetching;

export const activeWorkspaceIdSelector = (state: ReduxState): string =>
  state.workspaces.activeWorkspaceId;

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

    if (!firstIncluded) {
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
  (sourceWorkspacesById): Record<string, string> =>
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

const limitIdsToIncluded = (workspaces: Workspace[]): string[] =>
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
