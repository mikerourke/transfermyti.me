import { createAction, createAsyncAction } from "typesafe-actions";
import { Mapping, UsersByIdModel } from "~/typeDefs";

export const createUsers = createAsyncAction(
  "@users/CREATE_USERS_REQUEST",
  "@users/CREATE_USERS_SUCCESS",
  "@users/CREATE_USERS_FAILURE",
)<void, void, void>();

export const deleteUsers = createAsyncAction(
  "@users/DELETE_USERS_REQUEST",
  "@users/DELETE_USERS_SUCCESS",
  "@users/DELETE_USERS_FAILURE",
)<void, void, void>();

export const fetchUsers = createAsyncAction(
  "@users/FETCH_USERS_REQUEST",
  "@users/FETCH_USERS_SUCCESS",
  "@users/FETCH_USERS_FAILURE",
)<void, Record<Mapping, UsersByIdModel>, void>();

export const flipIsUserIncluded = createAction("@users/FLIP_IS_INCLUDED")<
  string
>();
