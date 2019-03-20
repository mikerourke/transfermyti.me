import React from 'react';
import NotificationsDisplay from '~/containers/app/notificationsDisplay/NotificationsDisplay';
import Header from './components/Header';
import TransferWizard from './components/TransferWizard';

const App: React.FC = () => (
  <>
    <Header />
    <TransferWizard />
    <NotificationsDisplay />
  </>
);

export default App;
