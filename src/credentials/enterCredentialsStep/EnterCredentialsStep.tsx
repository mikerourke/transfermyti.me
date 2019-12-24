import React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { isEmpty } from "lodash";
import { ControlLabel, Form, FormControl, FormGroup } from "rsuite";
import { PayloadActionCreator } from "typesafe-actions";
import { Path } from "history";
import { selectToolHelpDetailsByMapping } from "~/app/appSelectors";
import {
  storeCredentials,
  updateCredentials,
  validateCredentials,
} from "~/credentials/credentialsActions";
import {
  selectCredentials,
  selectIsValidating,
  selectValidationErrorsByTool,
} from "~/credentials/credentialsSelectors";
import { HelpMessage, NavigationButtonsRow } from "~/components";
import { useDeepCompareEffect } from "~/components/hooks";
import ToolHelpBlock from "./ToolHelpBlock";
import { RoutePath, ToolHelpDetailsModel } from "~/app/appTypes";
import { Mapping } from "~/common/commonTypes";
import { CredentialsModel } from "~/credentials/credentialsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  credentials: CredentialsModel;
  isValidating: boolean;
  toolHelpDetailsByMapping: Record<Mapping, ToolHelpDetailsModel>;
  validationErrorsByTool: Record<string, string>;
}

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
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
    // Do nothing.
    return () => {
      props.onStoreCredentials();
    };
  }, []);

  useDeepCompareEffect(() => {
    if (!isEmpty(props.validationErrorsByTool)) {
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

  const handleFormChange = (value: Record<string, string>): void => {
    setInputValues({ ...inputValues, ...value });
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
    const toolName = event.target.name as keyof InputFields;
    const fieldName = toolName.concat("ApiKey");
    props.onUpdateCredentials({ [fieldName]: inputValues[toolName] });
  };

  const handleBackClick = (): void => {
    props.onPush(RoutePath.TransferType);
  };

  const handleNextClick = (): void => {
    validateForm();
  };

  return (
    <div>
      <HelpMessage title="Tool Credentials">
        Enter your Clockify and Toggl API keys. Press the
        <strong> Next</strong> button to validate your keys and move on to the
        Workspace selection step.
      </HelpMessage>
      <Form
        fluid
        css={{ margin: "1rem 1rem 0", input: { fontFamily: "monospace" } }}
        onChange={handleFormChange}
        formValue={inputValues}
      >
        {Object.entries(props.toolHelpDetailsByMapping).map(
          ([mapping, { toolName, displayName, toolLink }]) => (
            <FormGroup key={mapping}>
              <ControlLabel>{displayName} API Key</ControlLabel>
              <FormControl
                name={toolName}
                onBlur={handleInputBlur}
                onFocus={clearError}
                errorMessage={inputErrors[toolName]}
              />
              <ToolHelpBlock displayName={displayName} toolLink={toolLink} />
            </FormGroup>
          ),
        )}
      </Form>
      <NavigationButtonsRow
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
        isLoading={props.isValidating}
      />
    </div>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  credentials: selectCredentials(state),
  isValidating: selectIsValidating(state),
  toolHelpDetailsByMapping: selectToolHelpDetailsByMapping(state),
  validationErrorsByTool: selectValidationErrorsByTool(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onStoreCredentials: storeCredentials.request,
  onUpdateCredentials: updateCredentials,
  onValidateCredentials: validateCredentials.request,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnterCredentialsStepComponent);
