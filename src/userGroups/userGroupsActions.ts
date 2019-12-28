import { createAsyncAction, createAction } from "typesafe-actions";
import { Mapping } from "~/entities/entitiesTypes";
import { UserGroupsByIdModel } from "./userGroupsTypes";

export const createUserGroups = createAsyncAction(
  "@userGroups/CREATE_USER_GROUPS_REQUEST",
  "@userGroups/CREATE_USER_GROUPS_SUCCESS",
  "@userGroups/CREATE_USER_GROUPS_FAILURE",
)<void, Record<Mapping, UserGroupsByIdModel>, void>();

export const fetchUserGroups = createAsyncAction(
  "@userGroups/FETCH_USER_GROUPS_REQUEST",
  "@userGroups/FETCH_USER_GROUPS_SUCCESS",
  "@userGroups/FETCH_USER_GROUPS_FAILURE",
)<void, Record<Mapping, UserGroupsByIdModel>, void>();

export const flipIsUserGroupIncluded = createAction(
  "@userGroups/FLIP_IS_INCLUDED",
)<string>();

export const addUserIdToGroup = createAction(
  "@userGroups/ADD_USER_ID_TO_GROUP",
)<{ mapping: Mapping; userId: string; userGroupId: string }>();
