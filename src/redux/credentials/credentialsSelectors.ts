import { toolNameByMappingSelector } from "~/redux/allEntities/allEntitiesSelectors";
import { createSelector } from "~/redux/reduxTools";
import {
  FetchStatus,
  Mapping,
  ToolName,
  type Credentials,
  type CredentialsByMapping,
  type ReduxState,
  type ValidationErrorsByMapping,
} from "~/types";

export const validationFetchStatusSelector = (state: ReduxState): FetchStatus =>
  state.credentials.validationFetchStatus;

export const validationErrorsByMappingSelector = (
  state: ReduxState,
): ValidationErrorsByMapping => state.credentials.validationErrorsByMapping;

export const hasValidationErrorsSelector = createSelector(
  validationErrorsByMappingSelector,
  (validationErrorsByMapping): boolean =>
    Object.values(validationErrorsByMapping).some(Boolean),
);

const sourceCredentialsSelector = (state: ReduxState): Credentials =>
  state.credentials.source;

const targetCredentialsSelector = (state: ReduxState): Credentials =>
  state.credentials.target;

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
    }) as Record<ToolName, Credentials>,
);
