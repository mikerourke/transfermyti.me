import { createAction, createAsyncAction } from "typesafe-actions";
import {
  CredentialsByMappingModel,
  PartialCredentialsUpdateModel,
  ValidationErrorsByMappingModel,
} from "./credentialsTypes";

export const storeCredentials = createAction("@credentials/STORE_CREDENTIALS")<
  void
>();

export const validateCredentials = createAsyncAction(
  "@credentials/VALIDATE_CREDENTIALS_REQUEST",
  "@credentials/VALIDATE_CREDENTIALS_SUCCESS",
  "@credentials/VALIDATE_CREDENTIALS_FAILURE",
)<void, CredentialsByMappingModel, ValidationErrorsByMappingModel>();

export const resetIsValidating = createAction(
  "@credentials/RESET_IS_VALIDATING",
)<void>();

export const updateCredentials = createAction(
  "@credentials/UPDATE_CREDENTIALS",
)<PartialCredentialsUpdateModel>();
