import { handleActions, combineActions } from 'redux-actions';
import {
  credentialsValidationStarted,
  credentialsValidationSuccess,
  credentialsValidationFailure,
  updateCredentialsField,
  allCredentialsStored,
} from './credentialsActions';
import { CredentialsModel } from '~/types/credentialsTypes';
import { ReduxAction } from '~/types/commonTypes';

export interface CredentialsState extends CredentialsModel {
  readonly isValid: boolean;
  readonly isValidating: boolean;
}

export const initialState: CredentialsState = {
  togglEmail: '',
  togglApiKey: '',
  clockifyUserId: '',
  clockifyApiKey: '',
  isValid: false,
  isValidating: false,
};

export default handleActions(
  {
    [allCredentialsStored]: (
      state: CredentialsState,
      { payload: credentials }: ReduxAction<CredentialsModel>,
    ): CredentialsState => ({
      ...state,
      ...credentials,
    }),

    [credentialsValidationSuccess]: (
      state: CredentialsState,
      { payload: credentials }: ReduxAction<CredentialsModel>,
    ): CredentialsState => ({
      ...state,
      ...credentials,
      isValid: true,
    }),

    [credentialsValidationFailure]: (
      state: CredentialsState,
    ): CredentialsState => ({
      ...state,
      isValid: false,
    }),

    [credentialsValidationStarted]: (
      state: CredentialsState,
    ): CredentialsState => ({
      ...state,
      isValidating: true,
    }),

    [combineActions(
      credentialsValidationSuccess,
      credentialsValidationFailure,
    )]: (state: CredentialsState): CredentialsState => ({
      ...state,
      isValidating: false,
    }),

    [updateCredentialsField]: (
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
