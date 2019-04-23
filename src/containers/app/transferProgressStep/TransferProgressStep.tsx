import React, { useState } from 'react';
import { When } from 'react-if';
import { connect } from 'react-redux';
import { Button } from 'bloomer';
import { css } from 'emotion';
import { get } from 'lodash';
import { selectTotalCountOfPendingTransfers } from '~/redux/entities/entitiesSelectors';
import { transferEntitiesToClockifyWorkspace } from '~/redux/entities/workspaces/workspacesActions';
import { selectTogglIncludedWorkspacesById } from '~/redux/entities/workspaces/workspacesSelectors';
import Flex from '~/components/flex/Flex';
import StepPage, { StepPageProps } from '~/components/stepPage/StepPage';
import ConfirmationModal from './components/ConfirmationModal';
import TransferSuccess from './components/TransferSuccess';
import ProgressIndicators from './ProgressIndicators';
import { CompoundWorkspaceModel, ReduxDispatch, ReduxState } from '~/types';

interface ConnectStateProps {
  togglWorkspacesById: Record<string, CompoundWorkspaceModel>;
  totalPendingCount: number;
}

interface ConnectDispatchProps {
  onTransferEntitiesToClockifyWorkspace: (
    workspace: CompoundWorkspaceModel,
  ) => Promise<any>;
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

  const transferAllEntitiesToClockify = async () => {
    setTransferStatus(TransferStatus.InProgress);
    const workspaces = Object.values(props.togglWorkspacesById);
    for (const workspace of workspaces) {
      setInTransferWorkspace(workspace);
      await props.onTransferEntitiesToClockifyWorkspace(workspace);
    }
    setTransferStatus(TransferStatus.Complete);
  };

  const handleModalConfirmClick = async () => {
    setIsModalActive(false);
    await transferAllEntitiesToClockify();
  };

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
            <p
              className={css`
                margin-bottom: 1rem;
              `}
            >
              Press the start button to below to begin transferring your data to
              Clockify. A progress indicator will let you know how things are
              going.
            </p>
            <p
              className={css`
                color: var(--info);
                font-weight: bold;
              `}
            >
              Just an FYI: the transfer might take a little while, so please be
              patient. Maybe go grab a snack or something.
            </p>
          </>
        }
      >
        <Flex
          justifyContent="center"
          className={css`
            margin-top: 1rem;
            padding: 1rem;
          `}
        >
          <When condition={transferStatus === TransferStatus.Waiting}>
            <Button
              className={css`
                text-transform: uppercase;
                font-weight: bold;
                margin: 4rem 0;
              `}
              isSize="large"
              isColor="info"
              isOutlined
              onClick={() => setIsModalActive(true)}
            >
              ⚡ Start the Transfer ⚡
            </Button>
          </When>
          <When condition={transferStatus === TransferStatus.InProgress}>
            <Flex direction="column">
              <div>{get(inTransferWorkspace, 'name')}</div>
              <ProgressIndicators totalPendingCount={props.totalPendingCount} />
            </Flex>
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
  totalPendingCount: selectTotalCountOfPendingTransfers(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onTransferEntitiesToClockifyWorkspace: (workspace: CompoundWorkspaceModel) =>
    dispatch(transferEntitiesToClockifyWorkspace(workspace)),
});

export default connect<ConnectStateProps, ConnectDispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(TransferProgressStepComponent);
