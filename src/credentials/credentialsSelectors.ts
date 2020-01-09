import { createSelector } from "reselect";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import {
  CredentialsByMappingModel,
  CredentialsModel,
  FetchStatus,
  Mapping,
  ReduxState,
  ToolName,
  ValidationErrorsByMappingModel,
} from "~/typeDefs";

export const validationFetchStatusSelector = (state: ReduxState): FetchStatus =>
  state.credentials.validationFetchStatus;

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
