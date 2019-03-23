import React from 'react';
import { connect } from 'react-redux';
import { Columns } from 'bloomer';
import { css } from 'emotion';
import { updateTransferType } from '~/redux/app/appActions';
import { selectCurrentTransferType } from '~/redux/app/appSelectors';
import StepPage, { StepPageProps } from '~/components/stepPage/StepPage';
import TransferTypeColumn from './components/TransferTypeColumn';
import { TransferType } from '~/types/appTypes';
import { ReduxDispatch, ReduxState } from '~/types/commonTypes';

interface ConnectStateProps {
  currentTransferType: TransferType;
}

interface ConnectDispatchProps {
  onUpdateTransferType: (newTransferType: TransferType) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const SelectTransferTypeStepComponent: React.FC<Props> = ({
  currentTransferType,
  onUpdateTransferType,
  ...stepPageProps
}) => {
  const handleTransferTypeSelect = (transferType: TransferType) => () => {
    onUpdateTransferType(transferType);
  };

  return (
    <StepPage subtitle="Select Transfer Type" {...stepPageProps}>
      <p
        className={css`
          margin-bottom: 1.25rem;
        `}
      >
        Select whether you're transferring entries for just yourself or multiple
        users. Press the <strong>Next</strong> button when you're done.
      </p>
      <div
        className={css`
          margin-bottom: 1.25rem;
        `}
      >
        <Columns isCentered>
          <TransferTypeColumn
            title="Single User"
            isSelected={currentTransferType === TransferType.SingleUser}
            onSelect={handleTransferTypeSelect(TransferType.SingleUser)}
          >
            Select this option if you're not the owner/member of an organization
            and you want to transfer <strong>your </strong>
            entries to Clockify.
          </TransferTypeColumn>
          <TransferTypeColumn
            title="Multiple Users"
            isSelected={currentTransferType === TransferType.MultipleUsers}
            onSelect={handleTransferTypeSelect(TransferType.MultipleUsers)}
          >
            Select this option if you have multiple user groups/users and you'd
            like to transfer <strong>all</strong> entries for you and the
            members of your team.
          </TransferTypeColumn>
        </Columns>
      </div>
    </StepPage>
  );
};

const mapStateToProps = (state: ReduxState) => ({
  currentTransferType: selectCurrentTransferType(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onUpdateTransferType: (newTransferType: TransferType) =>
    dispatch(updateTransferType(newTransferType)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTransferTypeStepComponent);
