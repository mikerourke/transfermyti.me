import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type { Mapping, Workspace } from "~/types";

export const activeWorkspaceIdUpdated = createAction<string>(
  "@workspaces/activeWorkspaceIdUpdated",
);

export const contentsForMappingReset = createAction<Mapping>(
  "@workspaces/contentsForMappingReset",
);

export const isWorkspaceIncludedToggled = createAction<Workspace>(
  "@workspaces/isWorkspaceIncludedToggled",
);

interface UserIdsAppendedPayload {
  mapping: Mapping;
  workspaceId: string;
  userIds: string[];
}

export const userIdsAppendedToWorkspace = createAction<UserIdsAppendedPayload>(
  "@workspaces/userIdsAppendedToWorkspace",
);

interface WorkspaceLinkingPayload {
  sourceId: string;
  targetId: string | null;
}

export const workspaceLinkingUpdated = createAction<WorkspaceLinkingPayload>(
  "@workspaces/workspaceLinkingUpdated",
);

export const createWorkspaces = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Workspace>>,
  undefined
>("@workspaces/createWorkspaces");

export const fetchWorkspaces = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Workspace>>,
  undefined
>("@workspaces/fetchWorkspaces");
