import { type ActionType, createReducer } from "typesafe-actions";

import * as credentialsActions from "~/modules/credentials/credentialsActions";
import {
  FetchStatus,
  type Credentials,
  type ValidationErrorsByMapping,
} from "~/typeDefs";

type CredentialsAction = ActionType<typeof credentialsActions>;

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

export const initialState: CredentialsState = {
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

export const credentialsReducer = createReducer<
  CredentialsState,
  CredentialsAction
>(initialState)
  .handleAction(credentialsActions.validateCredentials.request, (state) => ({
    ...state,
    validationFetchStatus: FetchStatus.InProcess,
    validationErrorsByMapping: { ...DEFAULT_VALIDATION_ERRORS },
  }))
  .handleAction(
    credentialsActions.validateCredentials.failure,
    (state, { payload }) => ({
      ...state,
      validationFetchStatus: FetchStatus.Error,
      validationErrorsByMapping: payload,
    }),
  )
  .handleAction(
    credentialsActions.validateCredentials.success,
    (state, { payload }) => ({
      ...state,
      ...payload,
      validationFetchStatus: FetchStatus.Success,
      validationErrorsByMapping: { ...DEFAULT_VALIDATION_ERRORS },
    }),
  )
  .handleAction(credentialsActions.flushCredentials, () => ({
    ...initialState,
  }))
  .handleAction(credentialsActions.updateCredentials, (state, { payload }) => {
    const { mapping, ...credentials } = payload;
    return {
      ...state,
      [mapping]: {
        ...state[mapping],
        ...credentials,
      },
    };
  })
  .handleAction(credentialsActions.apiKeysUpdated, (state, { payload }) => {
    const source = {
      ...state.source,
      apiKey: payload.source ?? state.source.apiKey,
    };

    const target = {
      ...state.target,
      apiKey: payload.target ?? state.target.apiKey,
    };

    return {
      ...state,
      source,
      target,
    };
  })
  .handleAction(
    credentialsActions.updateValidationFetchStatus,
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
  );
