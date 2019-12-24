import { createAsyncAction, createAction } from "typesafe-actions";
import { MappedEntityRecordsModel, Mapping } from "~/common/commonTypes";
import {
  UpdateIncludedWorkspaceYearModel,
  WorkspaceModel,
} from "./workspacesTypes";

export const fetchWorkspaces = createAction("@workspaces/FETCH_WORKSPACES")<
  Mapping
>();

export const createWorkspaces = createAction("@workspaces/CREATE_WORKSPACES")<
  void
>();

export const createClockifyWorkspaces = createAsyncAction(
  "@workspaces/CREATE_CLOCKIFY_WORKSPACES_REQUEST",
  "@workspaces/CREATE_CLOCKIFY_WORKSPACES_SUCCESS",
  "@workspaces/CREATE_CLOCKIFY_WORKSPACES_FAILURE",
)<void, void, void>();

export const fetchClockifyWorkspaces = createAsyncAction(
  "@workspaces/FETCH_CLOCKIFY_WORKSPACES_REQUEST",
  "@workspaces/FETCH_CLOCKIFY_WORKSPACES_SUCCESS",
  "@workspaces/FETCH_CLOCKIFY_WORKSPACES_FAILURE",
)<void, MappedEntityRecordsModel<WorkspaceModel>, void>();

export const fetchTogglWorkspaces = createAsyncAction(
  "@workspaces/FETCH_TOGGL_WORKSPACES_REQUEST",
  "@workspaces/FETCH_TOGGL_WORKSPACES_SUCCESS",
  "@workspaces/FETCH_TOGGL_WORKSPACES_FAILURE",
)<void, MappedEntityRecordsModel<WorkspaceModel>, void>();

export const appendUserIdsToWorkspace = createAction(
  "@workspaces/APPEND_USER_IDS",
)<{ mapping: Mapping; workspaceId: string; userIds: string[] }>();

export const flipIsWorkspaceIncluded = createAction(
  "@workspaces/FLIP_IS_INCLUDED",
)<string>();

export const updateIsWorkspaceYearIncluded = createAction(
  "@workspaces/UPDATE_IS_WORKSPACE_YEAR_INCLUDED",
)<UpdateIncludedWorkspaceYearModel>();

export const updateWorkspaceNameBeingFetched = createAction(
  "@workspaces/UPDATE_WORKSPACE_NAME_BEING_FETCHED",
)<string | null>();

export const resetContentsForMapping = createAction(
  "@workspaces/RESET_CONTENTS_FOR_MAPPING",
)<Mapping>();
