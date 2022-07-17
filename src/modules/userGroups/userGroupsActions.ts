import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, UserGroup } from "~/typeDefs";

export const createUserGroups = createAsyncAction(
  "@userGroups/createUserGroupsRequest",
  "@userGroups/createUserGroupsSuccess",
  "@userGroups/createUserGroupsFailure",
)<undefined, Record<Mapping, Dictionary<UserGroup>>, undefined>();

export const deleteUserGroups = createAsyncAction(
  "@userGroups/deleteUserGroupsRequest",
  "@userGroups/deleteUserGroupsSuccess",
  "@userGroups/deleteUserGroupsFailure",
)<undefined, undefined, undefined>();

export const fetchUserGroups = createAsyncAction(
  "@userGroups/fetchUserGroupsRequest",
  "@userGroups/fetchUserGroupsSuccess",
  "@userGroups/fetchUserGroupsFailure",
)<undefined, Record<Mapping, Dictionary<UserGroup>>, undefined>();

export const isUserGroupIncludedToggled = createAction(
  "@userGroups/isUserGroupIncludedToggled",
)<string>();

// TODO: When adding multi-user transfer, we'll probably need to add this in.
export const userIdAddedToGroup = createAction(
  "@userGroups/userIdAddedToGroup",
)<{
  mapping: Mapping;
  userId: string;
  userGroupId: string;
}>();
