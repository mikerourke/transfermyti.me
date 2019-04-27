import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Help } from 'bloomer';
import { css } from 'emotion';
import { omit } from 'lodash';
import {
  storeAllCredentials,
  updateCredentialsField,
  validateCredentials,
} from '~/redux/credentials/credentialsActions';
import {
  selectCredentials,
  selectIsValid,
  selectIsValidating,
} from '~/redux/credentials/credentialsSelectors';
import StepPage, { StepPageProps } from '~/components/stepPage/StepPage';
import InputField from './components/InputField';
import {
  CredentialsModel,
  CredentialsField,
  ReduxDispatch,
  ReduxState,
} from '~/types';

interface ConnectStateProps {
  credentials: CredentialsModel;
  isValid: boolean;
  isValidating: boolean;
}

interface ConnectDispatchProps {
  onStoreAllCredentials: () => void;
  onUpdateCredentialsField: (field: CredentialsField, value: string) => void;
  onValidateCredentials: () => Promise<any>;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const EnterCredentialsStepComponent: React.FC<Props> = ({
  credentials,
  ...props
}) => {
  const [inputErrors, setInputErrors] = useState<Partial<CredentialsModel>>({
    togglApiKey: '',
    togglEmail: '',
    clockifyApiKey: '',
  });

  useEffect(() => {
    // Do nothing.
    return () => {
      props.onStoreAllCredentials();
    };
  }, []);

  useEffect(() => {
    if (props.isValid) props.onNextClick();
  }, [props.isValid]);

  const validateInputs = () => {
    const requiredCredentials = omit(
      credentials,
      'clockifyUserId',
      'togglUserId',
    );

    let invalidCount = 0;
    const newInputErrors = Object.entries(requiredCredentials).reduce(
      (acc, [key, value]) => {
        if (value !== '') return { ...acc, [key]: '' };

        invalidCount += 1;
        return {
          ...acc,
          [key]: 'You must specify a value',
        };
      },
      {},
    ) as CredentialsModel;

    setInputErrors(newInputErrors);
    return invalidCount === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;

    setInputErrors({
      ...inputErrors,
      [name]: value === '' ? 'You must specify a value' : '',
    });

    props.onUpdateCredentialsField(name as CredentialsField, value);
  };

  const handleNextClick = async () => {
    if (!validateInputs()) return;
    await props.onValidateCredentials();
  };

  const apiClass = css`
    font-family: monospace;
  `;

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
          className={apiClass}
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
          className={apiClass}
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

const mapStateToProps = (state: ReduxState) => ({
  credentials: selectCredentials(state),
  isValid: selectIsValid(state),
  isValidating: selectIsValidating(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onStoreAllCredentials: () => dispatch(storeAllCredentials()),
  onUpdateCredentialsField: (field: CredentialsField, value: string) =>
    dispatch(updateCredentialsField({ field, value })),
  onValidateCredentials: () => dispatch(validateCredentials()),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(EnterCredentialsStepComponent);
