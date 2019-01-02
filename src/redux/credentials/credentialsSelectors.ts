import { createSelector } from 'reselect';
import { CredentialsModel } from '../../types/credentialsTypes';
import { State } from '../rootReducer';

export const selectCredentials = createSelector(
  (state: State) => state.credentials,
  (credentials): CredentialsModel => credentials,
);

export const selectClockifyUserId = createSelector(
  selectCredentials,
  (credentials): string => credentials.clockifyUserId,
);

export const selectTogglUserEmail = createSelector(
  selectCredentials,
  (credentials): string => credentials.togglEmail,
);

export const selectIsValidating = (state: State): boolean =>
  state.credentials.isValidating;

export const selectIsValid = (state: State): boolean =>
  state.credentials.isValid;
