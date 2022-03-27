import { createAction, createAsyncAction } from "typesafe-actions";

import type {
  CredentialsByMapping,
  FetchStatus,
  Mapping,
  PartialCredentialsUpdate,
  ValidationErrorsByMapping,
} from "~/typeDefs";

export const validateCredentials = createAsyncAction(
  "@credentials/validateCredentialsRequest",
  "@credentials/validateCredentialsSuccess",
  "@credentials/validateCredentialsFailure",
)<void, CredentialsByMapping, ValidationErrorsByMapping>();

export const credentialsStored = createAction(
  "@credentials/credentialsStored",
)<void>();

export const credentialsFlushed = createAction(
  "@credentials/credentialsFlushed",
)<void>();

export const credentialsUpdated = createAction(
  "@credentials/credentialsUpdated",
)<PartialCredentialsUpdate>();

export const apiKeysUpdated = createAction("@credentials/apiKeysUpdated")<
  Record<Mapping, string>
>();

export const validationFetchStatusUpdated = createAction(
  "@credentials/validationFetchStatusUpdated",
)<FetchStatus>();
