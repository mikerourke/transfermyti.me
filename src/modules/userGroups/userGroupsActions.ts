import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, UserGroupsByIdModel } from "~/typeDefs";

export const createUserGroups = createAsyncAction(
  "@userGroups/CREATE_USER_GROUPS_REQUEST",
  "@userGroups/CREATE_USER_GROUPS_SUCCESS",
  "@userGroups/CREATE_USER_GROUPS_FAILURE",
)<void, Record<Mapping, UserGroupsByIdModel>, void>();

export const deleteUserGroups = createAsyncAction(
  "@userGroups/DELETE_USER_GROUPS_REQUEST",
  "@userGroups/DELETE_USER_GROUPS_SUCCESS",
  "@userGroups/DELETE_USER_GROUPS_FAILURE",
)<void, void, void>();

export const fetchUserGroups = createAsyncAction(
  "@userGroups/FETCH_USER_GROUPS_REQUEST",
  "@userGroups/FETCH_USER_GROUPS_SUCCESS",
  "@userGroups/FETCH_USER_GROUPS_FAILURE",
)<void, Record<Mapping, UserGroupsByIdModel>, void>();

export const flipIsUserGroupIncluded = createAction(
  "@userGroups/FLIP_IS_INCLUDED",
)<string>();

// TODO: When adding multi-user transfer, we'll probably need to add this in.
export const addUserIdToGroup = createAction(
  "@userGroups/ADD_USER_ID_TO_GROUP",
)<{ mapping: Mapping; userId: string; userGroupId: string }>();
