import { createSelector } from 'reselect';
import { ReduxState } from '~/types/commonTypes';
import { CredentialsModel } from '~/types/credentialsTypes';

export const selectCredentials = createSelector(
  (state: ReduxState) => state.credentials,
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

export const selectIsValidating = (state: ReduxState): boolean =>
  state.credentials.isValidating;

export const selectIsValid = (state: ReduxState): boolean =>
  state.credentials.isValid;
