import { handleActions, combineActions } from 'redux-actions';
import {
  updateCredentialsField,
  credentialsValidationStarted,
  credentialsValidationSuccess,
  credentialsValidationFailure,
  allCredentialsStored,
} from './credentialsActions';
import { CredentialsModel } from '../../types/credentials';

export interface CredentialsState extends CredentialsModel {
  readonly isValid: boolean;
  readonly isValidating: boolean;
}

export const initialState: CredentialsState = {
  togglEmail: '',
  togglApiKey: '',
  clockifyApiKey: '',
  isValid: false,
  isValidating: false,
};

export default handleActions(
  {
    [allCredentialsStored]: (
      state: CredentialsState,
      { payload: credentials }: any,
    ): CredentialsState => ({
      ...state,
      ...credentials,
    }),

    [credentialsValidationSuccess]: (
      state: CredentialsState,
    ): CredentialsState => ({
      ...state,
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
      { payload: { field, value } }: any,
    ): CredentialsState => ({
      ...state,
      [field]: value,
    }),
  },
  initialState,
);
