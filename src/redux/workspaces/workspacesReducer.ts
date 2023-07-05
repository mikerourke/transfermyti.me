import { concat, lensPath, set, uniq, view } from "ramda";

import { allEntitiesFlushed } from "~/redux/allEntities/allEntitiesActions";
import {
  createReducer,
  isActionOf,
  type ActionType,
  type AnyAction,
} from "~/redux/reduxTools";
import type { Workspace } from "~/types";

import * as workspacesActions from "./workspacesActions";

export interface WorkspacesState {
  readonly source: Dictionary<Workspace>;
  readonly target: Dictionary<Workspace>;
  readonly activeWorkspaceId: string;
  readonly isFetching: boolean;
}

export const workspacesInitialState: WorkspacesState = {
  source: {},
  target: {},
  activeWorkspaceId: "",
  isFetching: true,
};

export const workspacesReducer = createReducer<WorkspacesState>(
  workspacesInitialState,
  (builder) => {
    builder
      .addCase(
        workspacesActions.activeWorkspaceIdUpdated,
        (state, { payload }) => {
          state.activeWorkspaceId = payload;
        },
      )
      .addCase(
        workspacesActions.contentsForMappingReset,
        (state, { payload }) => ({
          ...state,
          [payload]: workspacesInitialState[payload],
        }),
      )
      .addCase(
        workspacesActions.isWorkspaceIncludedToggled,
        toggleWorkspaceIncluded,
      )
      .addCase(
        workspacesActions.workspaceLinkingUpdated,
        updateWorkspaceLinking,
      )
      .addCase(
        workspacesActions.userIdsAppendedToWorkspace,
        appendUserIdsToWorkspace,
      )
      .addCase(allEntitiesFlushed, () => ({ ...workspacesInitialState }))
      .addMatcher(isWorkspacesApiSuccessAction, (state, { payload }) => ({
        ...state,
        source: { ...state.source, ...payload.source },
        target: { ...state.target, ...payload.target },
        isFetching: false,
      }))
      .addMatcher(isWorkspacesApiRequestAction, (state) => {
        state.isFetching = true;
      })
      .addMatcher(isWorkspacesApiFailureAction, (state) => {
        state.isFetching = false;
      });
  },
);

function toggleWorkspaceIncluded(
  state: WorkspacesState,
  { payload }: ActionType<typeof workspacesActions.isWorkspaceIncludedToggled>,
): WorkspacesState {
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
}

function updateWorkspaceLinking(
  state: WorkspacesState,
  { payload }: ActionType<typeof workspacesActions.workspaceLinkingUpdated>,
): WorkspacesState {
  const { sourceId, targetId } = payload;

  const source = {
    ...state.source,
    [sourceId]: {
      ...state.source[sourceId],
      isIncluded: targetId !== null,
      linkedId: targetId,
    },
  };

  const target: Dictionary<Workspace> = {};

  for (const [workspaceId, workspace] of Object.entries(state.target)) {
    const idMatchesTarget = workspaceId === targetId;

    if (workspace.linkedId === sourceId || idMatchesTarget) {
      target[workspaceId] = {
        ...workspace,
        isIncluded: idMatchesTarget,
        linkedId: idMatchesTarget ? sourceId : null,
      };
    } else {
      target[workspaceId] = { ...workspace };
    }
  }

  return { ...state, source, target };
}

function appendUserIdsToWorkspace(
  state: WorkspacesState,
  { payload }: ActionType<typeof workspacesActions.userIdsAppendedToWorkspace>,
): WorkspacesState {
  const { mapping, workspaceId, userIds } = payload;

  const userIdLens = lensPath([mapping, workspaceId, "userIds"]);

  const newUserIds = uniq(concat(view(userIdLens, state) as string[], userIds));

  return set(userIdLens, newUserIds, state);
}

type WorkspacesCreateOrFetchSuccessAction = ActionType<
  | typeof workspacesActions.createWorkspaces.success
  | typeof workspacesActions.fetchWorkspaces.success
>;

function isWorkspacesApiSuccessAction(
  action: AnyAction,
): action is WorkspacesCreateOrFetchSuccessAction {
  return isActionOf(
    [
      workspacesActions.createWorkspaces.success,
      workspacesActions.fetchWorkspaces.success,
    ],
    action,
  );
}

type WorkspacesApiRequestAction = ActionType<
  | typeof workspacesActions.createWorkspaces.request
  | typeof workspacesActions.fetchWorkspaces.request
>;

function isWorkspacesApiRequestAction(
  action: AnyAction,
): action is WorkspacesApiRequestAction {
  return isActionOf(
    [
      workspacesActions.createWorkspaces.request,
      workspacesActions.fetchWorkspaces.request,
    ],
    action,
  );
}

type WorkspacesApiFailureAction = ActionType<
  | typeof workspacesActions.createWorkspaces.failure
  | typeof workspacesActions.fetchWorkspaces.failure
>;

function isWorkspacesApiFailureAction(
  action: AnyAction,
): action is WorkspacesApiFailureAction {
  return isActionOf(
    [
      workspacesActions.createWorkspaces.failure,
      workspacesActions.fetchWorkspaces.failure,
    ],
    action,
  );
}
