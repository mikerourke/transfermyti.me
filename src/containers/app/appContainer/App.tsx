import React from 'react';
import { Section } from 'bloomer';
import { Wizard, Steps, Step } from 'react-albus';
import EnterCredentialsStep from '../../credentials/enterCredentialsStep/EnterCredentialsStep';
import SelectTogglWorkspacesStep from '../../entities/selectTogglWorkspacesStep/SelectTogglWorkspacesStep';
import SelectTogglInclusionsStepComponent from '../../entities/selectTogglInclusionsStep/SelectTogglInclusionsStep';
import ReviewClockifyDetailsStep from '../../entities/reviewClockifyDetailsStep/ReviewClockifyDetailsStep';
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
              <SelectTogglInclusionsStepComponent
                previous={previous}
                next={next}
              />
            )}
          />
          <Step
            id="reviewClockifyDetails"
            render={({ previous, next }) => (
              <ReviewClockifyDetailsStep previous={previous} next={next} />
            )}
          />
        </Steps>
      </Wizard>
    </Section>
    <NotificationsDisplay />
  </>
);

export default App;
