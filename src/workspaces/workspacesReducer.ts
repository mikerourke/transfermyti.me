import { createReducer, ActionType } from "typesafe-actions";
import { uniq } from "lodash";
import { mod, toggle } from "shades";
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
    workspacesActions.resetContentsForTool,
    (state, { payload }) => ({
      ...state,
      [payload]: initialState[payload],
    }),
  )
  .handleAction(
    workspacesActions.appendUserIdsToWorkspace,
    (state, { payload }) => {
      const { toolName, workspaceId, userIds } = payload;

      return {
        ...state,
        [toolName]: {
          ...state[toolName],
          byId: {
            ...state[toolName].byId,
            [workspaceId]: {
              ...state[toolName].byId[workspaceId],
              userIds: uniq([
                ...state[toolName].byId[workspaceId].userIds,
                ...userIds,
              ]),
            },
          },
        },
      };
    },
  )
  .handleAction(
    workspacesActions.flipIsWorkspaceIncluded,
    (state, { payload }) => mod("source", payload, "isIncluded")(toggle)(state),
  )
  .handleAction(
    workspacesActions.updateIsWorkspaceYearIncluded,
    (state, { payload }) => {
      const { mapping, workspaceId, year, isIncluded } = payload;
      return mod(mapping, workspaceId, "inclusionsByYear", year, isIncluded);
    },
  );
