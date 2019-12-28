import { createSelector } from "reselect";
import * as R from "ramda";
import { Mapping } from "~/entities/entitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  WorkspaceModel,
  WorkspacesByIdModel,
} from "~/workspaces/workspacesTypes";

export const selectIfWorkspacesFetching = (state: ReduxState): boolean =>
  state.workspaces.isFetching;

export const selectActiveWorkspaceId = (state: ReduxState): string =>
  state.workspaces.activeWorkspaceId;

export const selectSourceWorkspacesById = createSelector(
  (state: ReduxState): WorkspacesByIdModel => state.workspaces.source,
  workspacesById => workspacesById,
);

export const selectTargetWorkspacesById = createSelector(
  (state: ReduxState): WorkspacesByIdModel => state.workspaces.target,
  workspacesById => workspacesById,
);

export const selectWorkspaceIdMapping = createSelector(
  selectSourceWorkspacesById,
  sourceWorkspacesById => {
    const workspaceIdMapping: Record<string, string> = {};

    for (const [id, workspace] of Object.entries(sourceWorkspacesById)) {
      if (!R.isNil(workspace.linkedId)) {
        workspaceIdMapping[id] = workspace.linkedId;
        workspaceIdMapping[workspace.linkedId] = workspace.id;
      }
    }

    return workspaceIdMapping;
  },
);

export const selectSourceWorkspaces = createSelector(
  selectSourceWorkspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const selectTargetWorkspaces = createSelector(
  selectTargetWorkspacesById,
  (workspacesById): WorkspaceModel[] => Object.values(workspacesById),
);

export const selectTargetWorkspaceId = createSelector(
  selectWorkspaceIdMapping,
  (_: ReduxState, sourceWorkspaceId: string) => sourceWorkspaceId,
  (workspaceIdMapping, sourceWorkspaceId): string | null =>
    R.propOr<null, Record<string, string>, string>(
      null,
      sourceWorkspaceId,
      workspaceIdMapping,
    ),
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

export const selectSourceWorkspacesForTransfer = createSelector(
  selectSourceWorkspaces,
  sourceWorkspaces =>
    sourceWorkspaces.filter(workspace => workspace.isIncluded),
);
