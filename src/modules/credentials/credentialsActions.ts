import { createAction, createAsyncAction } from "typesafe-actions";

import type {
  CredentialsByMapping,
  FetchStatus,
  Mapping,
  PartialCredentialsUpdate,
  ValidationErrorsByMapping,
} from "~/typeDefs";

export const storeCredentials = createAction(
  "@credentials/STORE_CREDENTIALS",
)<void>();

export const validateCredentials = createAsyncAction(
  "@credentials/VALIDATE_CREDENTIALS_REQUEST",
  "@credentials/VALIDATE_CREDENTIALS_SUCCESS",
  "@credentials/VALIDATE_CREDENTIALS_FAILURE",
)<void, CredentialsByMapping, ValidationErrorsByMapping>();

export const flushCredentials = createAction(
  "@credentials/FLUSH_CREDENTIALS",
)<void>();

export const updateCredentials = createAction(
  "@credentials/UPDATE_CREDENTIALS",
)<PartialCredentialsUpdate>();

export const apiKeysUpdated = createAction("@credentials/apiKeysUpdated")<
  Record<Mapping, string>
>();

export const updateValidationFetchStatus = createAction(
  "@credentials/UPDATE_VALIDATION_FETCH_STATUS",
)<FetchStatus>();
