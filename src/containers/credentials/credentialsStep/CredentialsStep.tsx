import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { Help } from 'bloomer';
import {
  storeAllCredentials,
  updateCredentialsField,
  validateCredentials,
} from '../../../redux/credentials/credentialsActions';
import {
  selectCredentials,
  selectIsValid,
  selectIsValidating,
} from '../../../redux/credentials/credentialsSelectors';
import StepPage from '../../../components/stepPage/StepPage';
import InputField from './components/InputField';
import { ReduxDispatch, ReduxState } from '../../../types/commonTypes';
import { CredentialsModel, CredentialsField } from '../../../types/credentialsTypes';

interface ConnectStateProps {
  credentials: CredentialsModel;
  isValidating: boolean;
  isValid: boolean;
}

interface ConnectDispatchProps {
  onUpdateCredentialsField: (field: CredentialsField, value: string) => void;
  onStoreAllCredentials: () => void;
  onValidateCredentials: () => Promise<any>;
}

interface OwnProps {
  next: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & OwnProps;

interface State {
  togglEmailError: string;
  togglApiKeyError: string;
  clockifyApiKeyError: string;
}

export class CredentialsStepComponent extends React.Component<Props, State> {
  state = {
    togglEmailError: '',
    togglApiKeyError: '',
    clockifyApiKeyError: '',
  };

  componentWillUnmount(): void {
    this.props.onStoreAllCredentials();
  }

  private validateInputs = () => {
    const { credentials } = this.props;

    let invalidCount = 0;
    const newState = Object.entries(credentials).reduce((acc, [key, value]) => {
      const errorField = `${key}Error`;
      if (value !== '') {
        return { ...acc, [errorField]: '' };
      }

      invalidCount += 1;
      return {
        ...acc,
        [errorField]: 'You must specify a value',
      };
    }, {});

    this.setState(newState as any);
    return invalidCount === 0;
  };

  private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;

    const errorField = `${name}Error`;
    const newState = {
      [errorField]: value === '' ? 'You must specify a value' : '',
    };
    this.setState(newState as any);

    this.props.onUpdateCredentialsField(name as CredentialsField, value);
  };

  private handleNextClick = async () => {
    if (!this.validateInputs()) return;
    await this.props.onValidateCredentials();
    if (this.props.isValid) this.props.next();
  };

  render() {
    const apiClass = css`
      font-family: monospace;
    `;

    const { credentials } = this.props;

    return (
      <StepPage
        title="Step 1:"
        subtitle="Enter Credentials"
        isNextLoading={this.props.isValidating}
        onNextClick={this.handleNextClick}
      >
        <p
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          Enter your credentials in the form below. If you need help, hover over
          the help icon. Press the <strong>Next</strong> button when
          you're done.
        </p>
        <form>
          <InputField
            label="Toggl Email"
            name={CredentialsField.TogglEmail}
            onChange={this.handleInputChange}
            type="text"
            value={credentials[CredentialsField.TogglEmail]}
            tooltip={
              <span>Email address associated with your Toggl account.</span>
            }
            errorText={this.state.togglEmailError}
          />
          <InputField
            label="Toggl API Key"
            name={CredentialsField.TogglApiKey}
            onChange={this.handleInputChange}
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
            errorText={this.state.togglApiKeyError}
          />
          <InputField
            label="Clockify API Key"
            name={CredentialsField.ClockifyApiKey}
            onChange={this.handleInputChange}
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
            errorText={this.state.clockifyApiKeyError}
          />
        </form>
      </StepPage>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  credentials: selectCredentials(state),
  isValidating: selectIsValidating(state),
  isValid: selectIsValid(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onUpdateCredentialsField: (field: CredentialsField, value: string) =>
    dispatch(updateCredentialsField(field, value)),
  onStoreAllCredentials: () => dispatch(storeAllCredentials()),
  onValidateCredentials: () => dispatch(validateCredentials()),
});

export default connect<ConnectStateProps, ConnectDispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(CredentialsStepComponent);
