import React from 'react';
import { Section } from 'bloomer';
import { Wizard, Steps, Step } from 'react-albus';
import EnterCredentialsStep from '../../credentials/enterCredentialsStep/EnterCredentialsStep';
import SelectTogglWorkspacesStep from '../../entities/selectTogglWorkspacesStep/SelectTogglWorkspacesStep';
import SelectTogglInclusionsStep from '../../entities/selectTogglInclusionsStep/SelectTogglInclusionsStep';
import ReviewClockifyDetailsStep from '../../entities/reviewClockifyDetailsStep/ReviewClockifyDetailsStep';
import NotificationsDisplay from '../notificationsDisplay/NotificationsDisplay';
import Header from './components/Header';

const App: React.FunctionComponent = () => (
  <>
    <Header />
    <Wizard>
      <Section>
        <Steps>
          <Step
            id="enterCredentials"
            render={({ next }) => <EnterCredentialsStep next={next} />}
          />
          <Step
            id="selectTogglWorkspaces"
            render={({ previous, next }) => (
              <SelectTogglWorkspacesStep previous={previous} next={next} />
            )}
          />
          <Step
            id="reviewTogglData"
            render={({ previous, next }) => (
              <SelectTogglInclusionsStep previous={previous} next={next} />
            )}
          />
          <Step
            id="reviewClockifyDetails"
            render={({ previous, next }) => (
              <ReviewClockifyDetailsStep previous={previous} next={next} />
            )}
          />
          <Step
            id="wrapUp"
            render={({ replace }) => <div>You're all done!</div>}
          />
        </Steps>
      </Section>
    </Wizard>
    <NotificationsDisplay />
  </>
);

export default App;
