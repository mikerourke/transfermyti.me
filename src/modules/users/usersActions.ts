import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, User } from "~/typeDefs";

export const createUsers = createAsyncAction(
  "@users/createUsersRequest",
  "@users/createUsersSuccess",
  "@users/createUsersFailure",
)<undefined, undefined, undefined>();

export const deleteUsers = createAsyncAction(
  "@users/deleteUsersRequest",
  "@users/deleteUsersSuccess",
  "@users/deleteUsersFailure",
)<undefined, undefined, undefined>();

export const fetchUsers = createAsyncAction(
  "@users/fetchUsersRequest",
  "@users/fetchUsersSuccess",
  "@users/fetchUsersFailure",
)<undefined, Record<Mapping, Dictionary<User>>, undefined>();

export const isUserIncludedToggled = createAction(
  "@users/isUserIncludedToggled",
)<string>();
