import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, Workspace } from "~/typeDefs";

export const createWorkspaces = createAsyncAction(
  "@workspaces/createWorkspacesRequest",
  "@workspaces/createWorkspacesSuccess",
  "@workspaces/createWorkspacesFailure",
)<undefined, Record<Mapping, Dictionary<Workspace>>, undefined>();

export const fetchWorkspaces = createAsyncAction(
  "@workspaces/fetchWorkspacesRequest",
  "@workspaces/fetchWorkspacesSuccess",
  "@workspaces/fetchWorkspacesFailure",
)<undefined, Record<Mapping, Dictionary<Workspace>>, undefined>();

export const activeWorkspaceIdUpdated = createAction(
  "@workspaces/activeWorkspaceIdUpdated",
)<string>();

export const workspaceLinkingUpdated = createAction(
  "@workspaces/workspaceLinkingUpdated",
)<{ sourceId: string; targetId: string | null }>();

export const userIdsAppendedToWorkspace = createAction(
  "@workspaces/userIdsAppendedToWorkspace",
)<{ mapping: Mapping; workspaceId: string; userIds: string[] }>();

export const isWorkspaceIncludedToggled = createAction(
  "@workspaces/isWorkspaceIncludedToggled",
)<Workspace>();

export const contentsForMappingReset = createAction(
  "@workspaces/contentsForMappingReset",
)<Mapping>();
