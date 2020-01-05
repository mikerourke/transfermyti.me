import { push } from "connected-react-router";
import { Path } from "history";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { toolHelpDetailsByMappingSelector } from "~/app/appSelectors";
import {
  resetIsValidating,
  storeCredentials,
  updateCredentials,
  validateCredentials,
} from "~/credentials/credentialsActions";
import {
  credentialsByMappingSelector,
  hasValidationErrorsSelector,
  isValidatingSelector,
  validationErrorsByMappingSelector,
} from "~/credentials/credentialsSelectors";
import { Button, HelpDetails, NavigationButtonsRow } from "~/components";
import { useDeepCompareEffect } from "~/components/hooks";
import ApiKeyInputField from "./ApiKeyInputField";
import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";
import { RoutePath, ToolHelpDetailsModel } from "~/app/appTypes";
import {
  CredentialsModel,
  PartialCredentialsUpdateModel,
  ValidationErrorsByMappingModel,
} from "~/credentials/credentialsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  credentialsByMapping: Record<Mapping, CredentialsModel>;
  hasValidationErrors: boolean;
  isValidating: boolean;
  toolHelpDetailsByMapping: Record<Mapping, ToolHelpDetailsModel>;
  validationErrorsByMapping: ValidationErrorsByMappingModel;
}

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
  onResetIfValidating: PayloadActionCreator<string, void>;
  onStoreCredentials: PayloadActionCreator<string, void>;
  onUpdateCredentials: (credentials: PartialCredentialsUpdateModel) => void;
  onValidateCredentials: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

const EnterApiKeysStepComponent: React.FC<Props> = props => {
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
    props.onResetIfValidating();

    return () => {
      props.onStoreCredentials();
    };
  }, []);

  useDeepCompareEffect(() => {
    if (props.hasValidationErrors) {
      setInputErrors({ ...defaultErrors, ...props.validationErrorsByMapping });
    }
  }, [
    props.hasValidationErrors,
    props.isValidating,
    props.validationErrorsByMapping,
  ]);

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
    props.onPush(RoutePath.PickTransferAction);
  };

  const handleNextClick = (): void => {
    validateForm();
  };

  const handleResetClick = (): void => {
    props.onResetIfValidating();
    setInputValues({ [Mapping.Source]: "", [Mapping.Target]: "" });
    setInputErrors({ ...defaultErrors });
  };

  const { source, target } = props.toolHelpDetailsByMapping;

  return (
    <section>
      <h1>Step 2: Enter Credentials</h1>
      <HelpDetails>
        Enter your the API key(s) for the tools associated with the transfer.
        Press the
        <strong> Next</strong> button to validate your keys and move on to the
        Workspace selection step.
      </HelpDetails>
      <form autoComplete="hidden" css={{ margin: "0 1rem" }}>
        {source.toolName !== ToolName.None && (
          <ApiKeyInputField
            mapping={Mapping.Source}
            toolHelpDetails={source}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            onFocus={clearError}
            value={inputValues.source ?? ""}
            errorMessage={inputErrors.source}
          />
        )}
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
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      >
        <Button variant="outline" onClick={handleResetClick}>
          Reset
        </Button>
      </NavigationButtonsRow>
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  credentialsByMapping: credentialsByMappingSelector(state),
  hasValidationErrors: hasValidationErrorsSelector(state),
  isValidating: isValidatingSelector(state),
  toolHelpDetailsByMapping: toolHelpDetailsByMappingSelector(state),
  validationErrorsByMapping: validationErrorsByMappingSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onResetIfValidating: resetIsValidating,
  onStoreCredentials: storeCredentials,
  onUpdateCredentials: updateCredentials,
  onValidateCredentials: validateCredentials.request,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnterApiKeysStepComponent);
