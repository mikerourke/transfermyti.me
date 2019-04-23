import React from 'react';
import { connect } from 'react-redux';
import { divide, round } from 'lodash';
import { Progress } from 'react-sweet-progress';
import {
  selectCountTransferred,
  selectInTransferDetails,
} from '~/redux/app/appSelectors';
import Flex from '~/components/flex/Flex';
import { InTransferDetailsModel, ReduxState } from '~/types';

interface ConnectStateProps {
  inTransferDetails: InTransferDetailsModel;
  countTransferred: number;
}

interface OwnProps {
  totalPendingCount: number;
}

type Props = ConnectStateProps & OwnProps;

const ProgressIndicatorsComponent: React.FC<Props> = ({
  inTransferDetails,
  countTransferred,
  totalPendingCount,
}) => {
  const { countCurrent, countTotal } = inTransferDetails;
  console.dir({
    group: inTransferDetails.entityGroup,
    countCurrent,
    countTotal,
    countTransferred,
    totalPendingCount,
  });

  const percentInGroup = divide(countCurrent, countTotal) * 100;
  const percentTotal = divide(countTransferred, totalPendingCount) * 100;
  return (
    <Flex>
      <Progress type="circle" width={70} percent={round(percentInGroup, 0)} />
      <Progress type="circle" percent={round(percentTotal, 0)} />
    </Flex>
  );
};

const mapStateToProps = (state: ReduxState) => ({
  inTransferDetails: selectInTransferDetails(state),
  countTransferred: selectCountTransferred(state),
});

export default connect<ConnectStateProps, null, OwnProps>(mapStateToProps)(
  ProgressIndicatorsComponent,
);
