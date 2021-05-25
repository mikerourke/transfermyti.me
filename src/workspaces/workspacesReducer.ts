import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";

import { flushAllEntities } from "~/allEntities/allEntitiesActions";
import { WorkspacesByIdModel } from "~/typeDefs";

import * as workspacesActions from "./workspacesActions";

type WorkspacesAction = ActionType<
  typeof workspacesActions | typeof flushAllEntities
>;

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
  isFetching: true,
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
    (state) => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      workspacesActions.createWorkspaces.failure,
      workspacesActions.fetchWorkspaces.failure,
    ],
    (state) => ({
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
    workspacesActions.updateWorkspaceLinking,
    (state, { payload }) => {
      const { sourceId, targetId } = payload;

      const source = {
        ...state.source,
        [sourceId]: {
          ...state.source[sourceId],
          isIncluded: targetId !== null,
          linkedId: targetId,
        },
      };

      const target = Object.entries({ ...state.target }).reduce(
        (acc, [workspaceId, workspace]) => {
          const idMatchesTarget = workspaceId === targetId;
          if (workspace.linkedId === sourceId || idMatchesTarget) {
            return {
              ...acc,
              [workspaceId]: {
                ...workspace,
                isIncluded: idMatchesTarget,
                linkedId: idMatchesTarget ? sourceId : null,
              },
            };
          }

          return { ...acc, [workspaceId]: workspace };
        },
        {},
      );

      return { ...state, source, target };
    },
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
      const { id, linkedId } = payload;
      const isIncluded = !state.source[id].isIncluded;
      const source = {
        ...state.source,
        [id]: {
          ...state.source[id],
          isIncluded,
          linkedId: isIncluded ? linkedId : null,
        },
      };

      let target = { ...state.target };
      if (linkedId) {
        target = {
          ...state.target,
          [linkedId]: {
            ...state.target[linkedId],
            isIncluded,
            linkedId: isIncluded ? id : null,
          },
        };
      }

      return { ...state, source, target };
    },
  )
  .handleAction(flushAllEntities, () => ({ ...initialState }));
