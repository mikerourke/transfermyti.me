import { ActionType, createReducer } from "typesafe-actions";
import * as credentialsActions from "./credentialsActions";
import {
  CredentialsModel,
  ValidationErrorsByMappingModel,
} from "./credentialsTypes";

type CredentialsAction = ActionType<typeof credentialsActions>;

export interface CredentialsState {
  readonly source: CredentialsModel;
  readonly target: CredentialsModel;
  readonly isValidating: boolean;
  readonly validationErrorsByMapping: ValidationErrorsByMappingModel;
}

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
  isValidating: false,
  validationErrorsByMapping: { source: null, target: null },
};

export const credentialsReducer = createReducer<
  CredentialsState,
  CredentialsAction
>(initialState)
  .handleAction(credentialsActions.validateCredentials.request, state => ({
    ...state,
    isValidating: true,
    validationErrorsByMapping: { source: null, target: null },
  }))
  .handleAction(
    credentialsActions.validateCredentials.failure,
    (state, { payload }) => ({
      ...state,
      isValidating: false,
      validationErrorsByMapping: payload,
    }),
  )
  .handleAction(
    credentialsActions.validateCredentials.success,
    (state, { payload }) => ({
      ...state,
      ...payload,
      isValidating: false,
      validationErrorsByMapping: { source: null, target: null },
    }),
  )
  .handleAction(credentialsActions.resetIsValidating, state => ({
    ...state,
    isValidating: false,
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
  });
