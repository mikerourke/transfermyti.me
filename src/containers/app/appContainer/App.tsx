import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { selectCurrentTransferType } from '~/redux/app/appSelectors';
import NotificationsDisplay from '~/containers/app/notificationsDisplay/NotificationsDisplay';
import Flex from '~/components/flex/Flex';
import Footer from './components/Footer';
import Header from './components/Header';
import TransferWizard from './components/TransferWizard';
import { TransferType } from '~/types/appTypes';
import { ReduxState } from '~/types/commonTypes';

interface Props {
  currentTransferType: TransferType;
}

const App: React.FC<Props> = ({ currentTransferType }) => (
  <Flex
    direction="column"
    className={css`
      height: 100vh;
    `}
  >
    <Header currentTransferType={currentTransferType} />
    <main
      className={css`
        flex-grow: 1;
        overflow-y: auto;
        padding: 1.5rem;
      `}
    >
      <TransferWizard />
    </main>
    <Footer />
    <NotificationsDisplay />
  </Flex>
);

const mapStateToProps = (state: ReduxState) => ({
  currentTransferType: selectCurrentTransferType(state),
});

export default connect(mapStateToProps)(App);
