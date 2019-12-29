import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { CredentialsModel, CredentialsField } from "./credentialsTypes";

export const credentialsSelector = createSelector(
  (state: ReduxState) => state.credentials,
  (credentials): CredentialsModel => credentials,
);

export const isValidatingSelector = (state: ReduxState): boolean =>
  state.credentials.isValidating;

export const validationErrorsByToolSelector = createSelector(
  (state: ReduxState) => state.credentials.validationErrorsByTool,
  validationErrorsByTool => validationErrorsByTool,
);

export const areCredentialsValidSelector = createSelector(
  credentialsSelector,
  credentials =>
    [
      CredentialsField.ClockifyApiKey,
      CredentialsField.TogglApiKey,
      CredentialsField.TogglEmail,
    ].every(fieldName => Boolean(credentials[fieldName])),
);
