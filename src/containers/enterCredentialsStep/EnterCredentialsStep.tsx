import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Help } from "bloomer";
import { omit } from "lodash";
import {
  storeAllCredentials,
  updateCredentialsField,
  validateCredentials,
} from "~/credentials/credentialsActions";
import {
  selectCredentials,
  selectIsValid,
  selectIsValidating,
} from "~/credentials/credentialsSelectors";
import { StepPage, StepPageProps } from "~/components";
import InputField from "./InputField";
import {
  CredentialsField,
  CredentialsModel,
} from "~/credentials/credentialsTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  credentials: CredentialsModel;
  isValid: boolean;
  isValidating: boolean;
}

interface ConnectDispatchProps {
  onStoreAllCredentials: VoidFunction;
  onUpdateCredentialsField: (details: {
    field: CredentialsField;
    value: string;
  }) => void;
  onValidateCredentials: VoidPromise;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const EnterCredentialsStepComponent: React.FC<Props> = ({
  credentials,
  ...props
}) => {
  const [inputErrors, setInputErrors] = useState<Partial<CredentialsModel>>({
    togglApiKey: "",
    togglEmail: "",
    clockifyApiKey: "",
  });

  useEffect(() => {
    // Do nothing.
    return () => {
      props.onStoreAllCredentials();
    };
  }, []);

  useEffect(() => {
    if (props.isValid) {
      props.onNextClick();
    }
  }, [props.isValid]);

  const validateInputs = (): boolean => {
    const requiredCredentials = omit(
      credentials,
      "clockifyUserId",
      "togglUserId",
    );

    let invalidCount = 0;
    const newInputErrors = Object.entries(requiredCredentials).reduce(
      (acc, [key, value]) => {
        if (value !== "") {
          return { ...acc, [key]: "" };
        }

        invalidCount += 1;
        return {
          ...acc,
          [key]: "You must specify a value",
        };
      },
      {},
    ) as CredentialsModel;

    setInputErrors(newInputErrors);
    return invalidCount === 0;
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const { name, value } = event.currentTarget;

    setInputErrors({
      ...inputErrors,
      [name]: value === "" ? "You must specify a value" : "",
    });

    const validName = name as CredentialsField;
    props.onUpdateCredentialsField({ field: validName, value });
  };

  const handleNextClick = async (): Promise<void> => {
    if (!validateInputs()) {
      return;
    }
    await props.onValidateCredentials();
  };

  return (
    <StepPage
      stepNumber={props.stepNumber}
      subtitle="Enter Credentials"
      isNextLoading={props.isValidating}
      onPreviousClick={props.onPreviousClick}
      onNextClick={handleNextClick}
      instructions={
        <p>
          Enter your credentials in the form below. If you need help, hover over
          the help icon. Press the <strong>Next</strong> button when you&apos;re
          ready to move onto the next step.
        </p>
      }
    >
      <form>
        <InputField
          label="Toggl Email"
          name={CredentialsField.TogglEmail}
          onChange={handleInputChange}
          type="text"
          value={credentials[CredentialsField.TogglEmail]}
          tooltip={
            <span>Email address associated with your Toggl account.</span>
          }
          errorText={inputErrors.togglEmail}
        />
        <InputField
          label="Toggl API Key"
          name={CredentialsField.TogglApiKey}
          onChange={handleInputChange}
          type="text"
          value={credentials[CredentialsField.TogglApiKey]}
          css={{ fontFamily: "monospace" }}
          tooltip={
            <span>
              API key associated with your Toggl account.
              <Help
                tag="a"
                href="https://toggl.com/app/profile"
                target="_blank"
                rel="noopener"
                isColor="info"
              >
                Click to view your Toggl profile page
              </Help>
            </span>
          }
          errorText={inputErrors.togglApiKey}
        />
        <InputField
          label="Clockify API Key"
          name={CredentialsField.ClockifyApiKey}
          onChange={handleInputChange}
          type="text"
          value={credentials[CredentialsField.ClockifyApiKey]}
          css={{ fontFamily: "monospace" }}
          tooltip={
            <span>
              API key associated with your Clockify account.
              <Help
                tag="a"
                href="https://clockify.me/user/settings"
                target="_blank"
                rel="noopener"
                isColor="info"
              >
                Click to view your Clockify profile page
              </Help>
            </span>
          }
          errorText={inputErrors.clockifyApiKey}
        />
      </form>
    </StepPage>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  credentials: selectCredentials(state),
  isValid: selectIsValid(state),
  isValidating: selectIsValidating(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onStoreAllCredentials: storeAllCredentials,
  onUpdateCredentialsField: updateCredentialsField,
  onValidateCredentials: validateCredentials as VoidPromise,
};

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(EnterCredentialsStepComponent);
