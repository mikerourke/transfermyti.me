import React, { useEffect, useState } from "react";
import { When } from "react-if";
import { connect } from "react-redux";
import { Button } from "bloomer";
import { css } from "emotion";
import { get } from "lodash";
import { updateCountsOverallBeforeTransfer } from "~/redux/app/appActions";
import {
  selectInTransferDetails,
  selectAggregateTransferCounts,
} from "~/redux/app/appSelectors";
import { transferEntitiesToClockifyWorkspace } from "~/redux/entities/workspaces/workspacesActions";
import { selectTogglIncludedWorkspacesById } from "~/redux/entities/workspaces/workspacesSelectors";
import Flex from "~/components/flex/Flex";
import StepPage, { StepPageProps } from "~/components/stepPage/StepPage";
import ConfirmationModal from "./components/ConfirmationModal";
import InstructionsList from "./components/InstructionsList";
import ProgressIndicators from "./components/ProgressIndicators";
import TransferSuccess from "./components/TransferSuccess";
import {
  AggregateTransferCountsModel,
  CompoundWorkspaceModel,
  InTransferDetailsModel,
  ReduxDispatch,
  ReduxState,
  TransferCountsModel,
} from "~/types";

interface ConnectStateProps {
  togglWorkspacesById: Record<string, CompoundWorkspaceModel>;
  inTransferDetails: InTransferDetailsModel;
  aggregateTransferCounts: AggregateTransferCountsModel;
}

interface ConnectDispatchProps {
  onTransferEntitiesToClockifyWorkspace: (
    workspace: CompoundWorkspaceModel,
  ) => Promise<any>;
  onUpdateCountTotalOverallBeforeTransfer: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

enum TransferStatus {
  Waiting,
  InProgress,
  Complete,
}

export const TransferProgressStepComponent: React.FC<Props> = props => {
  const [isModalActive, setIsModalActive] = useState<boolean>(false);
  const [transferStatus, setTransferStatus] = useState<TransferStatus>(
    TransferStatus.Waiting,
  );
  const [inTransferWorkspace, setInTransferWorkspace] = useState<
    CompoundWorkspaceModel | {}
  >({});
  const [workspaceTransferCounts, setWorkspaceTransferCounts] = useState<
    TransferCountsModel
  >({ countCurrent: 0, countTotal: 0 });

  useEffect(() => {
    props.onUpdateCountTotalOverallBeforeTransfer();
  }, []);

  const transferAllEntitiesToClockify = async () => {
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

  const handleModalConfirmClick = async () => {
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

const mapStateToProps = (state: ReduxState) => ({
  togglWorkspacesById: selectTogglIncludedWorkspacesById(state),
  inTransferDetails: selectInTransferDetails(state),
  aggregateTransferCounts: selectAggregateTransferCounts(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onTransferEntitiesToClockifyWorkspace: (workspace: CompoundWorkspaceModel) =>
    dispatch(transferEntitiesToClockifyWorkspace(workspace)),
  onUpdateCountTotalOverallBeforeTransfer: () =>
    dispatch(updateCountsOverallBeforeTransfer()),
});

export default connect<ConnectStateProps, ConnectDispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(TransferProgressStepComponent);
