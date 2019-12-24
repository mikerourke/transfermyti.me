import { createAsyncAction, createAction } from "typesafe-actions";
import { CredentialsModel } from "./credentialsTypes";

export const storeCredentials = createAsyncAction(
  "@credentials/STORE_CREDENTIALS_REQUEST",
  "@credentials/STORE_CREDENTIALS_SUCCESS",
  "@credentials/STORE_CREDENTIALS_FAILURE",
)<void, CredentialsModel, void>();

export const validateCredentials = createAsyncAction(
  "@credentials/VALIDATE_CREDENTIALS_REQUEST",
  "@credentials/VALIDATE_CREDENTIALS_SUCCESS",
  "@credentials/VALIDATE_CREDENTIALS_FAILURE",
)<void, Partial<CredentialsModel>, Record<string, string>>();

export const updateCredentials = createAction(
  "@credentials/UPDATE_CREDENTIALS",
)<Partial<CredentialsModel>>();
