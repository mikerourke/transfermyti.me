import { createReducer, ActionType } from "typesafe-actions";
import R from "ramda";
import * as workspacesActions from "./workspacesActions";
import { WorkspaceModel } from "./workspacesTypes";

type WorkspacesAction = ActionType<typeof workspacesActions>;

export interface WorkspacesState {
  readonly source: Record<string, WorkspaceModel>;
  readonly target: Record<string, WorkspaceModel>;
  readonly workspaceNameBeingFetched: string | null;
  readonly isFetching: boolean;
}

export const initialState: WorkspacesState = {
  source: {},
  target: {},
  workspaceNameBeingFetched: null,
  isFetching: false,
};

export const workspacesReducer = createReducer<
  WorkspacesState,
  WorkspacesAction
>(initialState)
  .handleAction(
    [
      workspacesActions.fetchClockifyWorkspaces.success,
      workspacesActions.fetchTogglWorkspaces.success,
    ],
    (state, { payload }) => ({
      ...state,
      [payload.mapping]: {
        ...state[payload.mapping],
        ...payload.recordsById,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      workspacesActions.createClockifyWorkspaces.request,
      workspacesActions.fetchClockifyWorkspaces.request,
      workspacesActions.fetchTogglWorkspaces.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      workspacesActions.createClockifyWorkspaces.success,
      workspacesActions.createClockifyWorkspaces.failure,
      workspacesActions.fetchClockifyWorkspaces.failure,
      workspacesActions.fetchTogglWorkspaces.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    workspacesActions.updateWorkspaceNameBeingFetched,
    (state, { payload }) => ({
      ...state,
      workspaceNameBeingFetched: payload,
    }),
  )
  .handleAction(
    workspacesActions.resetContentsForMapping,
    (state, { payload }) => ({
      ...state,
      [payload]: initialState[payload],
    }),
  )
  .handleAction(
    workspacesActions.appendUserIdsToWorkspace,
    (state, { payload }) => {
      const { mapping, workspaceId, userIds } = payload;
      const userIdLens = R.lensPath([mapping, workspaceId, "userIds"]);
      const newUserIds = R.uniq(
        R.concat(R.view(userIdLens, state) as string[], userIds),
      );
      return R.set(userIdLens, newUserIds, state);
    },
  )
  .handleAction(
    workspacesActions.flipIsWorkspaceIncluded,
    (state, { payload }) =>
      R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  )
  .handleAction(
    workspacesActions.updateIsWorkspaceYearIncluded,
    (state, { payload }) => {
      const { mapping, workspaceId, year, isIncluded } = payload;
      return R.set(
        R.lensPath([mapping, workspaceId, "inclusionsByYear", year]),
        isIncluded,
        state,
      );
    },
  );
