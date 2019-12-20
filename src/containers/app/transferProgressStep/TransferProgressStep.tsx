import React from "react";
import { When } from "react-if";
import { connect } from "react-redux";
import { Button } from "bloomer";
import { css } from "emotion";
import { get } from "lodash";
import { updateCountsOverallBeforeTransfer } from "~/app/appActions";
import {
  selectInTransferDetails,
  selectAggregateTransferCounts,
} from "~/app/appSelectors";
import { transferEntitiesToClockifyWorkspace } from "~/workspaces/workspacesActions";
import { selectTogglIncludedWorkspacesById } from "~/workspaces/workspacesSelectors";
import Flex from "~/common/components/Flex";
import StepPage, { StepPageProps } from "~/common/components/stepPage/StepPage";
import ConfirmationModal from "./components/ConfirmationModal";
import InstructionsList from "./components/InstructionsList";
import ProgressIndicators from "./components/ProgressIndicators";
import TransferSuccess from "./components/TransferSuccess";
import {
  AggregateTransferCountsModel,
  InTransferDetailsModel,
  TransferCountsModel,
} from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { CompoundWorkspaceModel } from "~/workspaces/workspacesTypes";

interface ConnectStateProps {
  togglWorkspacesById: Record<string, CompoundWorkspaceModel>;
  inTransferDetails: InTransferDetailsModel;
  aggregateTransferCounts: AggregateTransferCountsModel;
}

interface ConnectDispatchProps {
  onTransferEntitiesToClockifyWorkspace: (
    workspace: CompoundWorkspaceModel,
  ) => void;
  onUpdateCountTotalOverallBeforeTransfer: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

enum TransferStatus {
  Waiting,
  InProgress,
  Complete,
}

export const TransferProgressStepComponent: React.FC<Props> = props => {
  const [isModalActive, setIsModalActive] = React.useState<boolean>(false);
  const [transferStatus, setTransferStatus] = React.useState<TransferStatus>(
    TransferStatus.Waiting,
  );
  const [inTransferWorkspace, setInTransferWorkspace] = React.useState<
    CompoundWorkspaceModel | {}
  >({});
  const [workspaceTransferCounts, setWorkspaceTransferCounts] = React.useState<
    TransferCountsModel
  >({ countCurrent: 0, countTotal: 0 });

  React.useEffect(() => {
    props.onUpdateCountTotalOverallBeforeTransfer();
  }, []);

  const transferAllEntitiesToClockify = async (): Promise<void> => {
    setTransferStatus(TransferStatus.InProgress);

    let workspaceNumber = 1;
    const workspaces = Object.values(props.togglWorkspacesById);
    for (const workspace of workspaces) {
      setInTransferWorkspace(workspace);
      setWorkspaceTransferCounts({
        countCurrent: workspaceNumber,
        countTotal: workspaces.length,
      });

      await props.onTransferEntitiesToClockifyWorkspace(workspace);

      workspaceNumber += 1;
    }

    setTransferStatus(TransferStatus.Complete);
  };

  const handleModalConfirmClick = async (): Promise<void> => {
    setIsModalActive(false);
    await transferAllEntitiesToClockify();
  };

  const workspaceName = get(inTransferWorkspace, "name", "None");

  return (
    <>
      <StepPage
        subtitle="Perform the Transfer"
        stepNumber={props.stepNumber}
        onPreviousClick={
          transferStatus === TransferStatus.Waiting
            ? props.onPreviousClick
            : undefined
        }
        instructions={
          <>
            <p className={css({ marginBottom: "1rem" })}>
              Press the start button to below to begin transferring your data to
              Clockify. After confirming the transfer, you&apos;ll see three
              progress indicators:
            </p>
            <InstructionsList />
            <p
              className={css({
                color: "var(--info)",
                fontWeight: 700,
                marginTop: "1rem",
              })}
            >
              Just an FYI: the transfer might take a little while, so please be
              patient. Maybe go grab a snack or something.
            </p>
          </>
        }
      >
        <Flex
          justifyContent="center"
          className={css({ marginTop: "1rem", padding: "1rem" })}
        >
          <When condition={transferStatus === TransferStatus.Waiting}>
            <Button
              className={css({
                textTransform: "uppercase",
                fontWeight: "bold",
                margin: "4rem 0",
              })}
              isSize="large"
              isColor="info"
              isOutlined
              onClick={() => setIsModalActive(true)}
            >
              ⚡ Start the Transfer ⚡
            </Button>
          </When>
          <When condition={transferStatus === TransferStatus.InProgress}>
            <ProgressIndicators
              inTransferDetails={props.inTransferDetails}
              workspaceName={workspaceName}
              aggregateTransferCounts={props.aggregateTransferCounts}
              workspaceTransferCounts={workspaceTransferCounts}
            />
          </When>
          <When condition={transferStatus === TransferStatus.Complete}>
            <TransferSuccess />
          </When>
        </Flex>
      </StepPage>
      <ConfirmationModal
        isActive={isModalActive}
        onConfirmClick={handleModalConfirmClick}
        onCancelClick={() => setIsModalActive(false)}
      />
    </>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  togglWorkspacesById: selectTogglIncludedWorkspacesById(state),
  inTransferDetails: selectInTransferDetails(state),
  aggregateTransferCounts: selectAggregateTransferCounts(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onTransferEntitiesToClockifyWorkspace: transferEntitiesToClockifyWorkspace,
  onUpdateCountTotalOverallBeforeTransfer: updateCountsOverallBeforeTransfer,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TransferProgressStepComponent);
