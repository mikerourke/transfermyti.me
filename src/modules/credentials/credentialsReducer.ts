import { createReducer } from "~/redux/reduxTools";
import {
  FetchStatus,
  type Credentials,
  type ValidationErrorsByMapping,
} from "~/typeDefs";

import * as credentialsActions from "./credentialsActions";

export interface CredentialsState {
  readonly source: Credentials;
  readonly target: Credentials;
  readonly validationErrorsByMapping: ValidationErrorsByMapping;
  readonly validationFetchStatus: FetchStatus;
}

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
            validationFetchStatus: payload,
            validationErrorsByMapping: newValidationErrors,
          };
        },
      )
      .addCase(credentialsActions.validateCredentials.request, (state) => ({
        ...state,
        validationFetchStatus: FetchStatus.InProcess,
        validationErrorsByMapping: { ...DEFAULT_VALIDATION_ERRORS },
      }))
      .addCase(
        credentialsActions.validateCredentials.failure,
        (state, { payload }) => ({
          ...state,
          validationFetchStatus: FetchStatus.Error,
          validationErrorsByMapping: payload,
        }),
      )
      .addCase(
        credentialsActions.validateCredentials.success,
        (state, { payload }) => ({
          ...state,
          ...payload,
          validationFetchStatus: FetchStatus.Success,
          validationErrorsByMapping: { ...DEFAULT_VALIDATION_ERRORS },
        }),
      );
  },
);
