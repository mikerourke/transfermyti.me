import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type {
  CredentialsByMapping,
  FetchStatus,
  Mapping,
  PartialCredentialsUpdate,
  ValidationErrorsByMapping,
} from "~/typeDefs";

export const apiKeysUpdated = createAction<Record<Mapping, string>>(
  "@credentials/apiKeysUpdated",
);

export const credentialsFlushed = createAction<undefined>(
  "@credentials/credentialsFlushed",
);

export const credentialsStored = createAction<undefined>(
  "@credentials/credentialsStored",
);

export const credentialsUpdated = createAction<PartialCredentialsUpdate>(
  "@credentials/credentialsUpdated",
);

export const validationFetchStatusUpdated = createAction<FetchStatus>(
  "@credentials/validationFetchStatusUpdated",
);

export const validateCredentials = createAsyncAction<
  undefined,
  CredentialsByMapping,
  ValidationErrorsByMapping
>("@credentials/validateCredentials");
