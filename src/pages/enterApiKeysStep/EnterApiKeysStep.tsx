import { push } from "connected-react-router";
import React from "react";
import { connect } from "react-redux";
import type { PayloadActionCreator } from "typesafe-actions";

import { Button, HelpDetails, NavigationButtonsRow } from "~/components";
import { useDeepCompareEffect } from "~/components/hooks";
import { toolHelpDetailsByMappingSelector } from "~/modules/allEntities/allEntitiesSelectors";
import * as credentialsActions from "~/modules/credentials/credentialsActions";
import {
  credentialsByMappingSelector,
  hasValidationErrorsSelector,
  validationErrorsByMappingSelector,
  validationFetchStatusSelector,
} from "~/modules/credentials/credentialsSelectors";
import {
  FetchStatus,
  Mapping,
  RoutePath,
  ToolName,
  type CredentialsModel,
  type PartialCredentialsUpdateModel,
  type ReduxState,
  type ToolHelpDetailsModel,
  type ValidationErrorsByMappingModel,
} from "~/typeDefs";

import ApiKeyInputField from "./ApiKeyInputField";

interface ConnectStateProps {
  credentialsByMapping: Record<Mapping, CredentialsModel>;
  hasValidationErrors: boolean;
  toolHelpDetailsByMapping: Record<Mapping, ToolHelpDetailsModel>;
  validationErrorsByMapping: ValidationErrorsByMappingModel;
  validationFetchStatus: FetchStatus;
}

interface ConnectDispatchProps {
  onPush: (path: RoutePath) => void;
  onStoreCredentials: PayloadActionCreator<string, void>;
  onUpdateCredentials: (credentials: PartialCredentialsUpdateModel) => void;
  onUpdateValidationFetchStatus: PayloadActionCreator<string, FetchStatus>;
  onValidateCredentials: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

const EnterApiKeysStepComponent: React.FC<Props> = (props) => {
  type InputFields = Record<string, string | null>;

  const defaultErrors: InputFields = {
    [Mapping.Source]: null,
    [Mapping.Target]: null,
  };

  const [inputValues, setInputValues] = React.useState<InputFields>({
    [Mapping.Source]: props.credentialsByMapping.source.apiKey ?? "",
    [Mapping.Target]: props.credentialsByMapping.target.apiKey ?? "",
  });

  const [inputErrors, setInputErrors] = React.useState<InputFields>({
    ...defaultErrors,
  });

  React.useEffect(() => {
    return () => {
      props.onStoreCredentials();
    };
  }, []);

  React.useEffect(() => {
    if (props.validationFetchStatus === FetchStatus.Success) {
      props.onPush(RoutePath.SelectWorkspaces);
    }
  }, [props.validationFetchStatus]);

  useDeepCompareEffect(() => {
    if (props.hasValidationErrors) {
      setInputErrors({ ...defaultErrors, ...props.validationErrorsByMapping });
    }
  }, [props.hasValidationErrors, props.validationErrorsByMapping]);

  const clearError = (event: React.FocusEvent<HTMLInputElement>): void => {
    const mapping = event.target.name as Mapping;
    setInputErrors({ ...inputErrors, [mapping]: null });
  };

  const validateForm = (): void => {
    let isValid = true;
    const newInputErrors: InputFields = { ...defaultErrors };

    for (const [mapping, value] of Object.entries(inputValues)) {
      const { toolName } = props.toolHelpDetailsByMapping[mapping];
      if (value === "" && toolName !== ToolName.None) {
        isValid = false;
        newInputErrors[mapping] = "This field is required";
      }
    }

    // If either of the inputs are empty, we don't want to move onto the next
    // step where we check the credentials, because we know they'll be
    // invalid:
    if (!isValid) {
      setInputErrors(newInputErrors);
      return;
    }

    props.onValidateCredentials();
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const mapping = event.target.name as Mapping;
    setInputValues({ ...inputValues, [mapping]: event.target.value });
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    const mapping = event.target.name as Mapping;
    props.onUpdateCredentials({ mapping, apiKey: event.target.value });
  };

  const handleBackClick = (): void => {
    props.onPush(RoutePath.PickToolAction);
  };

  const handleNextClick = (): void => {
    validateForm();
  };

  const handleResetClick = (): void => {
    props.onUpdateValidationFetchStatus(FetchStatus.Pending);
    setInputValues({ [Mapping.Source]: "", [Mapping.Target]: "" });
    setInputErrors({ ...defaultErrors });
  };

  const { source, target } = props.toolHelpDetailsByMapping;

  return (
    <section>
      <h1>Step 2: Enter API Keys</h1>

      <HelpDetails>
        <p>
          Enter your the API key for each tool in the input below. You can get
          the API key by clicking on the link above each input.
        </p>

        <p>
          These keys are needed to read and write data for the tools involved in
          the transfer. They are stored in global state while you use the tool.
          Once the transfer is complete, the values are cleared from state.
        </p>

        <p>
          Press the <strong>Next</strong> button to validate your keys and move
          on to the workspace selection step. If the key is invalid, an error
          message will be displayed below the invalid key.
        </p>
      </HelpDetails>

      <form
        autoComplete="off"
        style={{ margin: "0 1rem" }}
        onSubmit={(event) => event.preventDefault()}
      >
        <ApiKeyInputField
          mapping={Mapping.Source}
          toolHelpDetails={source}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onFocus={clearError}
          value={inputValues.source ?? ""}
          errorMessage={inputErrors.source}
        />

        {target.toolName !== ToolName.None && (
          <ApiKeyInputField
            mapping={Mapping.Target}
            toolHelpDetails={target}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            onFocus={clearError}
            value={inputValues.target ?? ""}
            errorMessage={inputErrors.target}
          />
        )}
      </form>

      <NavigationButtonsRow
        loading={props.validationFetchStatus === FetchStatus.InProcess}
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      >
        <Button variant="eggplant" onClick={handleResetClick}>
          Reset
        </Button>
      </NavigationButtonsRow>
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  credentialsByMapping: credentialsByMappingSelector(state),
  hasValidationErrors: hasValidationErrorsSelector(state),
  toolHelpDetailsByMapping: toolHelpDetailsByMappingSelector(state),
  validationErrorsByMapping: validationErrorsByMappingSelector(state),
  validationFetchStatus: validationFetchStatusSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onStoreCredentials: credentialsActions.storeCredentials,
  onUpdateCredentials: credentialsActions.updateCredentials,
  onUpdateValidationFetchStatus: credentialsActions.updateValidationFetchStatus,
  onValidateCredentials: credentialsActions.validateCredentials.request,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnterApiKeysStepComponent);
