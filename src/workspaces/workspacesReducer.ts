import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";
import * as workspacesActions from "./workspacesActions";
import { WorkspacesByIdModel } from "./workspacesTypes";

type WorkspacesAction = ActionType<typeof workspacesActions>;

export interface WorkspacesState {
  readonly source: WorkspacesByIdModel;
  readonly target: WorkspacesByIdModel;
  readonly activeWorkspaceId: string;
  readonly isFetching: boolean;
}

export const initialState: WorkspacesState = {
  source: {},
  target: {},
  activeWorkspaceId: "",
  isFetching: false,
};

export const workspacesReducer = createReducer<
  WorkspacesState,
  WorkspacesAction
>(initialState)
  .handleAction(
    [
      workspacesActions.createWorkspaces.success,
      workspacesActions.fetchWorkspaces.success,
    ],
    (state, { payload }) => ({
      ...state,
      source: {
        ...state.source,
        ...payload.source,
      },
      target: {
        ...state.target,
        ...payload.target,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      workspacesActions.createWorkspaces.request,
      workspacesActions.fetchWorkspaces.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      workspacesActions.createWorkspaces.failure,
      workspacesActions.fetchWorkspaces.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    workspacesActions.updateActiveWorkspaceId,
    (state, { payload }) => ({
      ...state,
      activeWorkspaceId: payload,
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
    (state, { payload }) => {
      const updatedState = R.over(
        R.lensPath(["source", payload.id, "isIncluded"]),
        R.not,
        state,
      );
      if (payload.linkedId) {
        return R.over(
          R.lensPath(["target", payload.linkedId, "isIncluded"]),
          R.not,
          updatedState,
        );
      }
      return updatedState;
    },
  );
