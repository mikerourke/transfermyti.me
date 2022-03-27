import { createSelector } from "reselect";

import { toolNameByMappingSelector } from "~/modules/allEntities/allEntitiesSelectors";
import {
  FetchStatus,
  Mapping,
  ToolName,
  type CredentialsByMapping,
  type Credentials,
  type ReduxState,
  type ValidationErrorsByMapping,
} from "~/typeDefs";

export const validationFetchStatusSelector = (state: ReduxState): FetchStatus =>
  state.credentials.validationFetchStatus;

export const validationErrorsByMappingSelector = createSelector(
  (state: ReduxState) => state.credentials.validationErrorsByMapping,
  (validationErrorsByMapping): ValidationErrorsByMapping =>
    validationErrorsByMapping,
);

export const hasValidationErrorsSelector = createSelector(
  validationErrorsByMappingSelector,
  (validationErrorsByMapping): boolean =>
    Object.values(validationErrorsByMapping).some(Boolean),
);

const sourceCredentialsSelector = createSelector(
  (state: ReduxState) => state.credentials.source,
  (sourceCredentials) => sourceCredentials,
);

const targetCredentialsSelector = createSelector(
  (state: ReduxState) => state.credentials.target,
  (targetCredentials) => targetCredentials,
);

export const credentialsByMappingSelector = createSelector(
  sourceCredentialsSelector,
  targetCredentialsSelector,
  (sourceCredentials, targetCredentials): CredentialsByMapping => ({
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
  ): Record<ToolName, Credentials> =>
    ({
      [toolNameByMapping[Mapping.Source]]: sourceCredentials,
      [toolNameByMapping[Mapping.Target]]: targetCredentials,
    } as Record<ToolName, Credentials>),
);
