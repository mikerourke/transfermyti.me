import { createAsyncAction, createAction } from "typesafe-actions";
import { Mapping } from "~/entities/entitiesTypes";
import {
  UpdateIncludedWorkspaceYearModel,
  WorkspacesByIdModel,
  WorkspaceModel,
} from "./workspacesTypes";

export const createWorkspaces = createAsyncAction(
  "@workspaces/CREATE_WORKSPACES_REQUEST",
  "@workspaces/CREATE_WORKSPACES_SUCCESS",
  "@workspaces/CREATE_WORKSPACES_FAILURE",
)<void, Record<Mapping, WorkspacesByIdModel>, void>();

export const fetchWorkspaces = createAsyncAction(
  "@workspaces/FETCH_WORKSPACES_REQUEST",
  "@workspaces/FETCH_WORKSPACES_SUCCESS",
  "@workspaces/FETCH_WORKSPACES_FAILURE",
)<void, Record<Mapping, WorkspacesByIdModel>, void>();

export const updateActiveWorkspaceId = createAction(
  "@workspaces/UPDATE_ACTIVE_WORKSPACE_ID",
)<string>();

export const appendUserIdsToWorkspace = createAction(
  "@workspaces/APPEND_USER_IDS",
)<{ mapping: Mapping; workspaceId: string; userIds: string[] }>();

export const flipIsWorkspaceIncluded = createAction(
  "@workspaces/FLIP_IS_INCLUDED",
)<WorkspaceModel>();

export const updateIsWorkspaceYearIncluded = createAction(
  "@workspaces/UPDATE_IS_WORKSPACE_YEAR_INCLUDED",
)<UpdateIncludedWorkspaceYearModel>();

export const resetContentsForMapping = createAction(
  "@workspaces/RESET_CONTENTS_FOR_MAPPING",
)<Mapping>();
