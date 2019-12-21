import React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { ControlLabel, Form, FormControl, FormGroup } from "rsuite";
import { Path } from "history";
import {
  storeAllCredentials,
  updateCredentials,
  validateCredentials,
} from "~/credentials/credentialsActions";
import {
  selectCredentials,
  selectIsValidating,
} from "~/credentials/credentialsSelectors";
import { HelpMessage, NavigationButtonsRow } from "~/components";
import ToolHelpBlock from "./ToolHelpBlock";
import { ToolName } from "~/common/commonTypes";
import { RoutePath } from "~/app/appTypes";
import { CredentialsModel } from "~/credentials/credentialsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  credentials: CredentialsModel;
  isValidating: boolean;
}

interface ConnectDispatchProps {
  onPush: (path: Path) => void;
  onStoreAllCredentials: VoidFunction;
  onUpdateCredentials: (credentials: Partial<CredentialsModel>) => void;
  onValidateCredentials: VoidPromise;
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
      props.onStoreAllCredentials();
    };
  }, []);

  const clearError = (event: React.FocusEvent<HTMLInputElement>): void => {
    const fieldName = event.target.name as keyof InputFields;
    setInputErrors({ ...inputErrors, [fieldName]: null });
  };

  const validateForm = async (): Promise<boolean> => {
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
      return isValid;
    }

    try {
      await props.onValidateCredentials();
    } catch (err) {
      isValid = false;
      setInputErrors({ ...defaultErrors, ...err });
    }

    return isValid;
  };

  const handleFormChange = (value: Partial<InputFields>): void => {
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

  const handleNextClick = async (): Promise<void> => {
    if (!(await validateForm())) {
      return;
    }
    props.onStoreAllCredentials();
    props.onPush(RoutePath.Workspaces);
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
        {Object.entries(ToolName).map(([displayName, toolName]) => (
          <FormGroup key={toolName}>
            <ControlLabel>{displayName} API Key</ControlLabel>
            <FormControl
              name={toolName}
              onBlur={handleInputBlur}
              onFocus={clearError}
              errorMessage={inputErrors[toolName]}
            />
            <ToolHelpBlock displayName={displayName} toolName={toolName} />
          </FormGroup>
        ))}
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
});

const mapDispatchToProps: ConnectDispatchProps = {
  onPush: push,
  onStoreAllCredentials: storeAllCredentials,
  onUpdateCredentials: updateCredentials,
  onValidateCredentials: validateCredentials as VoidPromise,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EnterCredentialsStepComponent);
