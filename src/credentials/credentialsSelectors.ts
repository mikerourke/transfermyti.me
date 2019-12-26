import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { CredentialsModel, CredentialsField } from "./credentialsTypes";

export const selectCredentials = createSelector(
  (state: ReduxState) => state.credentials,
  (credentials): CredentialsModel => credentials,
);

export const selectIsValidating = (state: ReduxState): boolean =>
  state.credentials.isValidating;

export const selectIfCredentialsValid = createSelector(
  selectCredentials,
  credentials =>
    [
      CredentialsField.ClockifyApiKey,
      CredentialsField.TogglApiKey,
      CredentialsField.TogglEmail,
    ].every(fieldName => Boolean(credentials[fieldName])),
);

export const selectValidationErrorsByTool = createSelector(
  (state: ReduxState) => state.credentials.validationErrorsByTool,
  validationErrorsByTool => validationErrorsByTool,
);
