import { createSelector } from "reselect";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  CredentialsByMappingModel,
  CredentialsModel,
  ValidationErrorsByMappingModel,
} from "./credentialsTypes";

export const isValidatingSelector = (state: ReduxState): boolean =>
  state.credentials.isValidating;

const sourceCredentialsSelector = createSelector(
  (state: ReduxState) => state.credentials.source,
  sourceCredentials => sourceCredentials,
);

const targetCredentialsSelector = createSelector(
  (state: ReduxState) => state.credentials.target,
  targetCredentials => targetCredentials,
);

export const credentialsByMappingSelector = createSelector(
  sourceCredentialsSelector,
  targetCredentialsSelector,
  (sourceCredentials, targetCredentials): CredentialsByMappingModel => ({
    [Mapping.Source]: sourceCredentials,
    [Mapping.Target]: targetCredentials,
  }),
);

export const credentialsByToolNameSelector = createSelector(
  toolNameByMappingSelector,
  sourceCredentialsSelector,
  targetCredentialsSelector,
  (
    toolNameByMapping,
    sourceCredentials,
    targetCredentials,
  ): Record<ToolName, CredentialsModel> =>
    ({
      [toolNameByMapping[Mapping.Source]]: sourceCredentials,
      [toolNameByMapping[Mapping.Target]]: targetCredentials,
    } as Record<ToolName, CredentialsModel>),
);

export const validationErrorsByMappingSelector = createSelector(
  (state: ReduxState) => state.credentials.validationErrorsByMapping,
  (validationErrorsByMapping): ValidationErrorsByMappingModel =>
    validationErrorsByMapping,
);

export const hasValidationErrorsSelector = createSelector(
  validationErrorsByMappingSelector,
  (validationErrorsByMapping): boolean =>
    Object.values(validationErrorsByMapping).some(Boolean),
);
