import { createReducer, ActionType } from "typesafe-actions";
import * as credentialsActions from "./credentialsActions";
import { CredentialsModel } from "./credentialsTypes";

type CredentialsAction = ActionType<typeof credentialsActions>;

export interface CredentialsState extends CredentialsModel {
  readonly isValidating: boolean;
  readonly validationErrorsByTool: Record<string, string>;
}

export const initialState: CredentialsState = {
  togglEmail: "",
  togglApiKey: "",
  togglUserId: "",
  clockifyUserId: "",
  clockifyApiKey: "",
  isValidating: false,
  validationErrorsByTool: {},
};

export const credentialsReducer = createReducer<
  CredentialsState,
  CredentialsAction
>(initialState)
  .handleAction(
    credentialsActions.storeCredentials.success,
    (state, { payload }) => ({
      ...state,
      ...payload,
    }),
  )
  .handleAction(credentialsActions.validateCredentials.request, state => ({
    ...state,
    isValidating: true,
    validationErrorsByTool: {},
  }))
  .handleAction(
    credentialsActions.validateCredentials.failure,
    (state, { payload }) => ({
      ...state,
      isValidating: false,
      validationErrorsByTool: payload,
    }),
  )
  .handleAction(
    credentialsActions.validateCredentials.success,
    (state, { payload }) => ({
      ...state,
      ...payload,
      isValidating: false,
      validationErrorsByTool: {},
    }),
  )
  .handleAction(credentialsActions.resetIsValidating, (state, { payload }) => ({
    ...state,
    isValidating: false,
  }))
  .handleAction(credentialsActions.updateCredentials, (state, { payload }) => ({
    ...state,
    ...payload,
  }));
