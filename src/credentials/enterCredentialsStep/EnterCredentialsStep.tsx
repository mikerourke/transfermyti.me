import { push } from "connected-react-router";
import { Path } from "history";
import * as R from "ramda";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { toolHelpDetailsByMappingSelector } from "~/app/appSelectors";
import { styled, HelpDetails, NavigationButtonsRow } from "~/components";
import { useDeepCompareEffect } from "~/components/hooks";
import {
  resetIsValidating,
  storeCredentials,
  updateCredentials,
  validateCredentials,
} from "~/credentials/credentialsActions";
import {
  credentialsSelector,
  isValidatingSelector,
  validationErrorsByToolSelector,
} from "~/credentials/credentialsSelectors";
import ApiKeyInputField from "./ApiKeyInputField";
import { RoutePath, ToolHelpDetailsModel } from "~/app/appTypes";
import { CredentialsModel } from "~/credentials/credentialsTypes";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";

const Form = styled.form({
  margin: "0 1rem",

  input: {
    fontFamily: "monospace",
    fontSize: "1.25rem",
    marginBottom: "1rem",
  },
});

interface ConnectStateProps {
  credentials: CredentialsModel;
  isValidating: boolean;
  toolHelpDetailsByMapping: Record<Mapping, ToolHelpDetailsModel>;
  validationErrorsByTool: Record<string, string>;
}

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
  onResetIfValidating: PayloadActionCreator<string, void>;
  onStoreCredentials: PayloadActionCreator<string, void>;
  onUpdateCredentials: (credentials: Partial<CredentialsModel>) => void;
  onValidateCredentials: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

const EnterCredentialsStepComponent: React.FC<Props> = props => {
  type InputFields = Record<string, string | null>;

  const defaultErrors: InputFields = { clockify: null, toggl: null };

  const [inputValues, setInputValues] = React.useState<InputFields>({
    clockify: props.credentials.clockifyApiKey,
    toggl: props.credentials.togglApiKey,
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
    if (!R.isEmpty(props.validationErrorsByTool)) {
      setInputErrors({ ...defaultErrors, ...props.validationErrorsByTool });
    }
  }, [props.isValidating, props.validationErrorsByTool]);

  const clearError = (event: React.FocusEvent<HTMLInputElement>): void => {
    const fieldName = event.target.name as keyof InputFields;
    setInputErrors({ ...inputErrors, [fieldName]: null });
  };

  const validateForm = (): void => {
    let isValid = true;
    const newInputErrors: InputFields = { ...defaultErrors };

    for (const [toolName, value] of Object.entries(inputValues)) {
      if (value === "") {
        isValid = false;
        newInputErrors[toolName] = "This field is required";
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
    const toolName = event.target.name as keyof InputFields;
    setInputValues({ ...inputValues, [toolName]: event.target.value });
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    const toolName = event.target.name as keyof InputFields;
    const fieldName = toolName.concat("ApiKey");
    props.onUpdateCredentials({ [fieldName]: inputValues[toolName] });
  };

  const handleBackClick = (): void => {
    props.onPush(RoutePath.TransferMapping);
  };

  const handleNextClick = (): void => {
    validateForm();
  };

  const { source, target } = props.toolHelpDetailsByMapping;

  return (
    <section>
      <h1>Step 2: Enter Credentials</h1>
      <HelpDetails>
        Enter your Clockify and Toggl API keys. Press the
        <strong> Next</strong> button to validate your keys and move on to the
        Workspace selection step.
      </HelpDetails>
      <Form autoComplete="hidden">
        <ApiKeyInputField
          mapping="source"
          toolHelpDetails={source}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onFocus={clearError}
          value={inputValues[source.toolName] as string}
          errorMessage={inputErrors[source.toolName]}
        />
        <ApiKeyInputField
          mapping="target"
          toolHelpDetails={target}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onFocus={clearError}
          value={inputValues[target.toolName] as string}
          errorMessage={inputErrors[target.toolName]}
        />
      </Form>
      <NavigationButtonsRow
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  credentials: credentialsSelector(state),
  isValidating: isValidatingSelector(state),
  toolHelpDetailsByMapping: toolHelpDetailsByMappingSelector(state),
  validationErrorsByTool: validationErrorsByToolSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onResetIfValidating: resetIsValidating,
  onStoreCredentials: storeCredentials.request,
  onUpdateCredentials: updateCredentials,
  onValidateCredentials: validateCredentials.request,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnterCredentialsStepComponent);
