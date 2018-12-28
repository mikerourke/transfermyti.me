import React from 'react';
import { Section } from 'bloomer';
import { Wizard, Steps, Step } from 'react-albus';
import CredentialsStep from '../../credentials/credentialsStep/CredentialsStep';
import WorkspacesStep from '../../entities/workspacesStep/WorkspacesStep';
import TogglReviewStep from '../../entities/togglReviewStep/TogglReviewStep';
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
            render={({ previous, next }) => (
              <WorkspacesStep previous={previous} next={next} />
            )}
          />
          <Step
            id="reviewTogglData"
            render={({ previous, next }) => (
              <TogglReviewStep previous={previous} next={next} />
            )}
          />
        </Steps>
      </Wizard>
    </Section>
    <NotificationsDisplay />
  </>
);

export default App;
