import { createAsyncAction, createAction } from "typesafe-actions";
import { MappedEntityRecordsModel, Mapping } from "~/common/commonTypes";
import { UserGroupModel } from "./userGroupsTypes";

export const createClockifyUserGroups = createAsyncAction(
  "@userGroups/CREATE_CLOCKIFY_USER_GROUPS_REQUEST",
  "@userGroups/CREATE_CLOCKIFY_USER_GROUPS_SUCCESS",
  "@userGroups/CREATE_CLOCKIFY_USER_GROUPS_FAILURE",
)<string, void, void>();

export const createTogglUserGroups = createAsyncAction(
  "@userGroups/CREATE_TOGGL_USER_GROUPS_REQUEST",
  "@userGroups/CREATE_TOGGL_USER_GROUPS_SUCCESS",
  "@userGroups/CREATE_TOGGL_USER_GROUPS_FAILURE",
)<string, void, void>();

export const fetchClockifyUserGroups = createAsyncAction(
  "@userGroups/FETCH_CLOCKIFY_USER_GROUPS_REQUEST",
  "@userGroups/FETCH_CLOCKIFY_USER_GROUPS_SUCCESS",
  "@userGroups/FETCH_CLOCKIFY_USER_GROUPS_FAILURE",
)<string, MappedEntityRecordsModel<UserGroupModel>, void>();

export const fetchTogglUserGroups = createAsyncAction(
  "@userGroups/FETCH_TOGGL_USER_GROUPS_REQUEST",
  "@userGroups/FETCH_TOGGL_USER_GROUPS_SUCCESS",
  "@userGroups/FETCH_TOGGL_USER_GROUPS_FAILURE",
)<string, MappedEntityRecordsModel<UserGroupModel>, void>();

export const flipIsUserGroupIncluded = createAction(
  "@userGroups/FLIP_IS_INCLUDED",
)<string>();

export const addUserIdToGroup = createAction(
  "@userGroups/ADD_USER_ID_TO_GROUP",
)<{ mapping: Mapping; userId: string; userGroupId: string }>();
