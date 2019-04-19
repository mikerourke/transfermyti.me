import React from 'react';
import { uniqueId } from 'lodash';
import { connect } from 'react-redux';
import {
  selectInTransferDetailsByGroup,
  selectInTransferWorkspaceName,
} from '~/redux/app/appSelectors';
import {
  InTransferDetailsByGroupModel,
  InTransferDetailsModel,
  ReduxState,
} from '~/types';
import { Container } from 'bloomer';
import PageHeader from '~/components/pageHeader/PageHeader';
import EntityGroupProgress from './components/EntityGroupProgress';

interface ConnectStateProps {
  inTransferWorkspaceName: string;
  inTransferDetailsByGroup: InTransferDetailsByGroupModel;
}

export const TransferProgressStepComponent: React.FC<ConnectStateProps> = ({
  inTransferWorkspaceName,
  inTransferDetailsByGroup,
}) => {
  return (
    <Container>
      <PageHeader title="Last Step:" subtitle="Behold the Magic!" />
      <div>{inTransferWorkspaceName}</div>
      <div>
        {Object.values(inTransferDetailsByGroup).map(
          (inTransferDetails: InTransferDetailsModel) => (
            <EntityGroupProgress
              key={uniqueId('ITR')}
              inTransferDetails={inTransferDetails}
            />
          ),
        )}
      </div>
    </Container>
  );
};

const mapStateToProps = (state: ReduxState) => ({
  inTransferWorkspaceName: selectInTransferWorkspaceName(state),
  inTransferDetailsByGroup: selectInTransferDetailsByGroup(state),
});

export default connect<ConnectStateProps>(mapStateToProps)(
  TransferProgressStepComponent,
);
