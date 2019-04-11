import { getType } from 'typesafe-actions';
import { handleActions, combineActions } from 'redux-actions';
import * as credentialsActions from './credentialsActions';
import { ReduxAction } from '~/types/commonTypes';
import { CredentialsModel } from '~/types/credentialsTypes';

export interface CredentialsState extends CredentialsModel {
  readonly isValid: boolean;
  readonly isValidating: boolean;
}

export const initialState: CredentialsState = {
  togglEmail: '',
  togglApiKey: '',
  togglUserId: '',
  clockifyUserId: '',
  clockifyApiKey: '',
  isValid: false,
  isValidating: false,
};

export const credentialsReducer = handleActions(
  {
    [getType(credentialsActions.allCredentialsStored)]: (
      state: CredentialsState,
      { payload: credentials }: ReduxAction<CredentialsModel>,
    ): CredentialsState => ({
      ...state,
      ...credentials,
    }),

    [getType(credentialsActions.credentialsValidation.success)]: (
      state: CredentialsState,
      { payload: credentials }: ReduxAction<CredentialsModel>,
    ): CredentialsState => ({
      ...state,
      ...credentials,
      isValid: true,
    }),

    [getType(credentialsActions.credentialsValidation.failure)]: (
      state: CredentialsState,
    ): CredentialsState => ({
      ...state,
      isValid: false,
    }),

    [getType(credentialsActions.credentialsValidation.request)]: (
      state: CredentialsState,
    ): CredentialsState => ({
      ...state,
      isValidating: true,
    }),

    [combineActions(
      getType(credentialsActions.credentialsValidation.success),
      getType(credentialsActions.credentialsValidation.failure),
    )]: (state: CredentialsState): CredentialsState => ({
      ...state,
      isValidating: false,
    }),

    [getType(credentialsActions.updateCredentialsField)]: (
      state: CredentialsState,
      {
        payload: { field, value },
      }: ReduxAction<{ field: string; value: string }>,
    ): CredentialsState => ({
      ...state,
      [field]: value,
    }),
  },
  initialState,
);
