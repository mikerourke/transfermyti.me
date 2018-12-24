import React from 'react';
import { css } from 'emotion';
import EntityTabs from './components/EntityTabs';

class TogglReview extends React.Component {
  public render() {
    return (
      <>
        <p
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          Pick which Workspaces and years you want to transfer to Clockify. If
          you want a preview of what's being transferred, press the
          <strong> Preview</strong> button after making your selections.
        </p>
        <p
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          Once you're done, press the <strong>Next</strong> button to move to
          the last step!
        </p>
        <EntityTabs />
      </>
    );
  }
}

export default TogglReview;
