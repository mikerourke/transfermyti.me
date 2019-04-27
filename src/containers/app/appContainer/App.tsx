import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { selectCurrentTransferType } from '~/redux/app/appSelectors';
import NotificationsDisplay from '~/containers/app/notificationsDisplay/NotificationsDisplay';
import Footer from './components/Footer';
import Header from './components/Header';
import TransferWizard from './components/TransferWizard';
import { ReduxState, TransferType } from '~/types';

// TODO: Add link to first page directing user to Clockify if they don't
//       already have an account (see email).
// TODO: Ensure that the production release isn't using the mock server.

interface Props {
  currentTransferType: TransferType;
}

const App: React.FC<Props> = ({ currentTransferType }) => (
  <div>
    <Header currentTransferType={currentTransferType} />
    <main
      className={css`
        overflow-y: auto;
        padding: 1.5rem;
      `}
    >
      <TransferWizard />
    </main>
    <Footer />
    <NotificationsDisplay />
  </div>
);

const mapStateToProps = (state: ReduxState) => ({
  currentTransferType: selectCurrentTransferType(state),
});

export default connect(mapStateToProps)(App);
