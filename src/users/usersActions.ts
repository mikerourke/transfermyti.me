import { createAsyncAction, createAction } from "typesafe-actions";
import { MappedEntityRecordsModel } from "~/common/commonTypes";
import { UserModel } from "./usersTypes";

export const createClockifyUsers = createAsyncAction(
  "@users/CREATE_CLOCKIFY_USERS_REQUEST",
  "@users/CREATE_CLOCKIFY_USERS_SUCCESS",
  "@users/CREATE_CLOCKIFY_USERS_FAILURE",
)<string, void, void>();

export const createTogglUsers = createAsyncAction(
  "@users/CREATE_TOGGL_USERS_REQUEST",
  "@users/CREATE_TOGGL_USERS_SUCCESS",
  "@users/CREATE_TOGGL_USERS_FAILURE",
)<string, void, void>();

export const fetchClockifyUsers = createAsyncAction(
  "@users/FETCH_CLOCKIFY_USERS_REQUEST",
  "@users/FETCH_CLOCKIFY_USERS_SUCCESS",
  "@users/FETCH_CLOCKIFY_USERS_FAILURE",
)<string, MappedEntityRecordsModel<UserModel>, void>();

export const fetchTogglUsers = createAsyncAction(
  "@users/FETCH_TOGGL_USERS_REQUEST",
  "@users/FETCH_TOGGL_USERS_SUCCESS",
  "@users/FETCH_TOGGL_USERS_FAILURE",
)<string, MappedEntityRecordsModel<UserModel>, void>();

export const flipIsUserIncluded = createAction("@users/FLIP_IS_INCLUDED")<
  string
>();
