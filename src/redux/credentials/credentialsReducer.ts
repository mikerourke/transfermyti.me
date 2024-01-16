import { createReducer } from "~/redux/reduxTools";
import {
  FetchStatus,
  type Credentials,
  type ValidationErrorsByMapping,
} from "~/types";

import * as credentialsActions from "./credentialsActions";

export type CredentialsState = Readonly<{
  source: Credentials;
  target: Credentials;
  validationErrorsByMapping: ValidationErrorsByMapping;
  validationFetchStatus: FetchStatus;
}>;

const DEFAULT_VALIDATION_ERRORS = {
  source: null,
  target: null,
};

export const credentialsInitialState: CredentialsState = {
  source: {
    apiKey: null,
    email: null,
    userId: null,
  },
  target: {
    apiKey: null,
    email: null,
    userId: null,
  },
  validationErrorsByMapping: { ...DEFAULT_VALIDATION_ERRORS },
  validationFetchStatus: FetchStatus.Pending,
};

export const credentialsReducer = createReducer<CredentialsState>(
  credentialsInitialState,
  (builder) => {
    builder
      .addCase(credentialsActions.apiKeysUpdated, (state, { payload }) => ({
        ...state,
        source: {
          ...state.source,
          apiKey: payload.source ?? state.source.apiKey,
        },
        target: {
          ...state.target,
          apiKey: payload.target ?? state.target.apiKey,
        },
      }))
      .addCase(credentialsActions.credentialsFlushed, () => ({
        ...credentialsInitialState,
      }))
      .addCase(credentialsActions.credentialsUpdated, (state, { payload }) => {
        const { mapping, ...credentials } = payload;
        return {
          ...state,
          [mapping]: {
            ...state[mapping],
            ...credentials,
          },
        };
      })
      .addCase(
        credentialsActions.validationFetchStatusUpdated,
        (state, { payload }) => {
          let newValidationErrors = { ...state.validationErrorsByMapping };
          if (payload === FetchStatus.Pending) {
            newValidationErrors = { ...DEFAULT_VALIDATION_ERRORS };
          }

          return {
            ...state,
            validationErrorsByMapping: newValidationErrors,
            validationFetchStatus: payload,
          };
        },
      )
      .addCase(credentialsActions.validateCredentials.request, (state) => ({
        ...state,
        validationErrorsByMapping: { ...DEFAULT_VALIDATION_ERRORS },
        validationFetchStatus: FetchStatus.InProcess,
      }))
      .addCase(
        credentialsActions.validateCredentials.failure,
        (state, { payload }) => ({
          ...state,
          validationErrorsByMapping: payload,
          validationFetchStatus: FetchStatus.Error,
        }),
      )
      .addCase(
        credentialsActions.validateCredentials.success,
        (state, { payload }) => ({
          ...state,
          ...payload,
          validationErrorsByMapping: { ...DEFAULT_VALIDATION_ERRORS },
          validationFetchStatus: FetchStatus.Success,
        }),
      );
  },
);
