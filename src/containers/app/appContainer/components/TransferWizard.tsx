import React from 'react';
import { Step, Steps, Wizard } from 'react-albus';
import SelectTransferTypeStep from '~/containers/app/selectTransferTypeStep/SelectTransferTypeStep';
import EnterCredentialsStep from '~/containers/credentials/enterCredentialsStep/EnterCredentialsStep';
import ReviewClockifyDetailsStep from '~/containers/entities/reviewClockifyDetailsStep/ReviewClockifyDetailsStep';
import SelectTogglInclusionsStep from '~/containers/entities/selectTogglInclusionsStep/SelectTogglInclusionsStep';
import SelectTogglWorkspacesStep from '~/containers/entities/selectTogglWorkspacesStep/SelectTogglWorkspacesStep';

const TransferWizard: React.FC = () => (
  <Wizard>
    <Steps>
      <Step
        id="selectWorkflowType"
        render={({ next }) => (
          <SelectTransferTypeStep stepNumber={1} onNextClick={next} />
        )}
      />
      <Step
        id="enterCredentials"
        render={({ previous, next }) => (
          <EnterCredentialsStep
            stepNumber={2}
            onPreviousClick={previous}
            onNextClick={next}
          />
        )}
      />
      <Step
        id="selectTogglWorkspaces"
        render={({ previous, next }) => (
          <SelectTogglWorkspacesStep
            stepNumber={3}
            onPreviousClick={previous}
            onNextClick={next}
          />
        )}
      />
      <Step
        id="reviewTogglData"
        render={({ previous, next }) => (
          <SelectTogglInclusionsStep
            stepNumber={4}
            onPreviousClick={previous}
            onNextClick={next}
          />
        )}
      />
      <Step
        id="reviewClockifyDetails"
        render={({ previous, next }) => (
          <ReviewClockifyDetailsStep
            stepNumber={5}
            onPreviousClick={previous}
            onNextClick={next}
          />
        )}
      />
      <Step id="wrapUp" render={() => <div>You&apos;re all done!</div>} />
    </Steps>
  </Wizard>
);

export default TransferWizard;
