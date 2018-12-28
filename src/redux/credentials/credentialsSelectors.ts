import { createSelector } from 'reselect';
import { State } from '../rootReducer';
import { CredentialsModel } from '../../types/credentialsTypes';

export const selectCredentials = createSelector(
  (state: State) => state.credentials,
  (credentials: CredentialsModel) => credentials,
);

export const selectIsValidating = (state: State): boolean =>
  state.credentials.isValidating;

export const selectIsValid = (state: State): boolean =>
  state.credentials.isValid;
