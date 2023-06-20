import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type { Mapping, User } from "~/types";

export const isUserIncludedToggled = createAction<string>(
  "@users/isUserIncludedToggled",
);

export const createUsers = createAsyncAction<undefined, undefined, undefined>(
  "@users/createUsersRequest",
);

export const deleteUsers = createAsyncAction<undefined, undefined, undefined>(
  "@users/deleteUsersRequest",
);

export const fetchUsers = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<User>>,
  undefined
>("@users/fetchUsersRequest");
