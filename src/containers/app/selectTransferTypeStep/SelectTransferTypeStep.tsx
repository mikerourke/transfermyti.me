import React from "react";
import { connect } from "react-redux";
import { Columns } from "bloomer";
import { css } from "emotion";
import { updateTransferType } from "~/app/appActions";
import { selectCurrentTransferType } from "~/app/appSelectors";
import StepPage, { StepPageProps } from "~/components/stepPage/StepPage";
import TransferTypeColumn from "./components/TransferTypeColumn";
import { TransferType } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

// TODO: Disable multi-user mode button and add column to delete all entries.

interface ConnectStateProps {
  currentTransferType: TransferType;
}

interface ConnectDispatchProps {
  onUpdateTransferType: (newTransferType: TransferType) => void;
}

export const SelectTransferTypeStepComponent: React.FC<Props> = ({
  currentTransferType,
  onUpdateTransferType,
  ...stepPageProps
}) => {
  const handleTransferTypeSelect = (
    transferType: TransferType,
  ): VoidFunction => (): void => {
    onUpdateTransferType(transferType);
  };

  return (
    <StepPage
      subtitle="Select Transfer Type"
      instructions={
        <p>
          Select whether you&apos;re transferring entries for just yourself or
          multiple users. Press the <strong>Next</strong> button when
          you&apos;re ready to move onto the next step.
        </p>
      }
      {...stepPageProps}
    >
      <div className={css({ padding: "0 0.25rem 2rem 0.25rem" })}>
        <Columns isCentered>
          <TransferTypeColumn
            isDisabled={false}
            isSelected={currentTransferType === TransferType.SingleUser}
            title="Single User"
            onSelect={handleTransferTypeSelect(TransferType.SingleUser)}
          >
            Select this option if you&apos;re not the owner/admin of an
            organization and you want to transfer <strong>your</strong> entries
            to Clockify.
          </TransferTypeColumn>
          <TransferTypeColumn
            isDisabled={true}
            isSelected={currentTransferType === TransferType.MultipleUsers}
            title="Multiple Users"
            onSelect={handleTransferTypeSelect(TransferType.MultipleUsers)}
          >
            Select this option if you have multiple user groups/users and
            you&apos;d like to transfer <strong>all</strong> entries for you and
            the members of your team.
          </TransferTypeColumn>
        </Columns>
      </div>
    </StepPage>
  );
};

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  currentTransferType: selectCurrentTransferType(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onUpdateTransferType: updateTransferType,
};

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTransferTypeStepComponent);
