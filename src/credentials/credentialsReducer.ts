import { ActionType, createReducer } from "typesafe-actions";
import * as credentialsActions from "./credentialsActions";
import { FetchStatus } from "~/allEntities/allEntitiesTypes";
import {
  CredentialsModel,
  ValidationErrorsByMappingModel,
} from "./credentialsTypes";

type CredentialsAction = ActionType<typeof credentialsActions>;

export interface CredentialsState {
  readonly source: CredentialsModel;
  readonly target: CredentialsModel;
  readonly validationErrorsByMapping: ValidationErrorsByMappingModel;
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
  .handleAction(credentialsActions.validateCredentials.request, state => ({
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
  )
  .handleAction(credentialsActions.updateCredentials, (state, { payload }) => {
    const { mapping, ...credentials } = payload;
    return {
      ...state,
      [mapping]: {
        ...state[mapping],
        ...credentials,
      },
    };
  });
