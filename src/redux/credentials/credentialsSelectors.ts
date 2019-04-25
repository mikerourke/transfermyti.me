import { createSelector } from 'reselect';
import { CredentialsModel, ReduxState } from '~/types';

export const selectCredentials = createSelector(
  (state: ReduxState) => state.credentials,
  (credentials): CredentialsModel => credentials,
);

export const selectIsValidating = (state: ReduxState): boolean =>
  state.credentials.isValidating;

export const selectIsValid = (state: ReduxState): boolean =>
  state.credentials.isValid;
