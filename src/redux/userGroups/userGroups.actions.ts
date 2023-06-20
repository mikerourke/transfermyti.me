import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type { Mapping, UserGroup } from "~/types";

interface UserAddedPayload {
  mapping: Mapping;
  userId: string;
  userGroupId: string;
}

export const isUserGroupIncludedToggled = createAction<string>(
  "@userGroups/isUserGroupIncludedToggled",
);

// TODO: When adding multi-user transfer, we'll probably need to add this in.
export const userIdAddedToGroup = createAction<UserAddedPayload>(
  "@userGroups/userIdAddedToGroup",
);

export const createUserGroups = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<UserGroup>>,
  undefined
>("@userGroups/createUserGroupsRequest");

export const deleteUserGroups = createAsyncAction<
  undefined,
  undefined,
  undefined
>("@userGroups/deleteUserGroupsRequest");

export const fetchUserGroups = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<UserGroup>>,
  undefined
>("@userGroups/fetchUserGroupsRequest");
