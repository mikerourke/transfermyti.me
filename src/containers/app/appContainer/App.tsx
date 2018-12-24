import React from 'react';
import { Section } from 'bloomer';
import { Wizard, Steps, Step } from 'react-albus';
import StepPage from '../../../components/stepPage/StepPage';
import CredentialsStep from '../../credentials/credentialsStep/CredentialsStep';
import WorkspacesStep from '../../entities/workspacesStep/WorkspacesStep';
import NotificationsDisplay from '../notificationsDisplay/NotificationsDisplay';
import Header from './components/Header';

const App: React.FunctionComponent = () => (
  <>
    <Header />
    <Section>
      <Wizard>
        <Steps>
          <Step
            id="credentials"
            render={({ next }) => <CredentialsStep next={next} />}
          />
          <Step
            id="selectTogglWorkspaces"
            render={({ next, previous }) => (
              <WorkspacesStep next={next} previous={previous} />
            )}
          />
          <Step
            id="transferToClockify"
            render={({ previous }) => (
              <StepPage
                title="Step 3:"
                subtitle="Transfer Data to Clockify"
                onPreviousClick={previous}
              >
                Yat
              </StepPage>
            )}
          />
        </Steps>
      </Wizard>
    </Section>
    <NotificationsDisplay />
  </>
);

export default App;
