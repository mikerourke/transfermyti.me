import { createReducer, ActionType } from "typesafe-actions";
import * as credentialsActions from "./credentialsActions";
import { CredentialsModel } from "~/types";

type CredentialsAction = ActionType<typeof credentialsActions>;

export interface CredentialsState extends CredentialsModel {
  readonly isValid: boolean;
  readonly isValidating: boolean;
}

export const initialState: CredentialsState = {
  togglEmail: "",
  togglApiKey: "",
  togglUserId: "",
  clockifyUserId: "",
  clockifyApiKey: "",
  isValid: false,
  isValidating: false,
};

export const credentialsReducer = createReducer<
  CredentialsState,
  CredentialsAction
>(initialState)
  .handleAction(
    credentialsActions.allCredentialsStored,
    (state, { payload }) => ({
      ...state,
      ...payload,
    }),
  )
  .handleAction(
    credentialsActions.credentialsValidation.success,
    (state, { payload }) => ({
      ...state,
      ...payload,
      isValid: true,
      isValidating: false,
    }),
  )
  .handleAction(credentialsActions.credentialsValidation.failure, state => ({
    ...state,
    isValid: false,
    isValidating: false,
  }))
  .handleAction(
    credentialsActions.updateAreCredentialsValid,
    (state, { payload }) => ({
      ...state,
      isValid: payload,
    }),
  )
  .handleAction(credentialsActions.credentialsValidation.request, state => ({
    ...state,
    isValidating: true,
  }))
  .handleAction(
    credentialsActions.updateCredentialsField,
    (state, { payload }) => ({
      ...state,
      [payload.field]: payload.value,
    }),
  );
