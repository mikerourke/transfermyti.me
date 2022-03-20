import { push } from "connected-react-router";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";

import { Flex, HelpDetails, NavigationButtonsRow, Note } from "~/components";
import {
  createAllEntities,
  deleteAllEntities,
  resetTransferCountsByEntityGroup,
} from "~/modules/allEntities/allEntitiesActions";
import {
  includedCountsByEntityGroupSelector,
  pushAllChangesFetchStatusSelector,
  toolActionSelector,
  transferCountsByEntityGroupSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import {
  CountsByEntityGroupModel,
  EntityGroup,
  FetchStatus,
  ReduxState,
  RoutePath,
  ToolAction,
} from "~/typeDefs";
import { capitalize, getEntityGroupDisplay } from "~/utils";

import ConfirmToolActionModal from "./ConfirmToolActionModal";
import ProgressBar from "./ProgressBar";

interface ConnectStateProps {
  pushAllChangesFetchStatus: FetchStatus;
  includedCountsByEntityGroup: CountsByEntityGroupModel;
  toolAction: ToolAction;
  transferCountsByEntityGroup: CountsByEntityGroupModel;
}

interface ConnectDispatchProps {
  onCreateAllEntities: PayloadActionCreator<string, void>;
  onDeleteAllEntities: PayloadActionCreator<string, void>;
  onPush: (path: RoutePath) => void;
  onResetTransferCountsByEntityGroup: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const PerformToolActionStepComponent: React.FC<Props> = (props) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] =
    React.useState<boolean>(false);
  const [totalCountsByEntityGroup, setTotalCountsByEntityGroup] =
    React.useState<CountsByEntityGroupModel>({} as CountsByEntityGroupModel);

  React.useEffect(() => {
    props.onResetTransferCountsByEntityGroup();
    setTotalCountsByEntityGroup(props.includedCountsByEntityGroup);
  }, []);

  React.useEffect(() => {
    // TODO: Fix this so it shows if an error has occurred.
    if (props.pushAllChangesFetchStatus === FetchStatus.Success) {
      props.onPush(RoutePath.ToolActionSuccess);
    }
  }, [props.pushAllChangesFetchStatus]);

  const closeModal = (): void => setIsConfirmModalOpen(false);

  const handleBackClick = (): void => {
    props.onPush(RoutePath.SelectInclusions);
  };

  const handleNextClick = (): void => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmClick = (): void => {
    setIsConfirmModalOpen(false);
    switch (props.toolAction) {
      case ToolAction.Delete:
        props.onDeleteAllEntities();
        break;

      case ToolAction.Transfer:
        props.onCreateAllEntities();
        break;

      default:
        break;
    }
  };

  const title =
    props.toolAction === ToolAction.None
      ? "Perform Action"
      : `Perform ${capitalize(props.toolAction)} Action`;

  // If the records are being deleted, the order of entity groups processed is
  // in reverse (starts with time entries):
  const orderedEntityGroups =
    props.toolAction === ToolAction.Delete
      ? [
          EntityGroup.TimeEntries,
          EntityGroup.Tasks,
          EntityGroup.Projects,
          EntityGroup.Tags,
          EntityGroup.Clients,
        ]
      : Object.keys(totalCountsByEntityGroup);

  return (
    <section>
      <h1>Step 5: {title}</h1>
      <HelpDetails>
        <p>
          Press the <strong>Start</strong> button and confirm the action in the
          dialog.
        </p>
        <Note>
          Note: This could take several minutes due to API rate limiting.
        </Note>
      </HelpDetails>
      <Flex flexDirection="column">
        {orderedEntityGroups.map((entityGroup) => (
          <ProgressBar
            key={entityGroup}
            css={{ marginTop: 0 }}
            title={getEntityGroupDisplay(entityGroup as EntityGroup)}
            completedCount={props.transferCountsByEntityGroup[entityGroup]}
            totalCount={totalCountsByEntityGroup[entityGroup]}
          />
        ))}
      </Flex>
      <NavigationButtonsRow
        disabled={props.pushAllChangesFetchStatus === FetchStatus.InProcess}
        nextLabel="Start"
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      />
      <ConfirmToolActionModal
        isOpen={isConfirmModalOpen}
        toolAction={props.toolAction}
        onClose={closeModal}
        onConfirm={handleConfirmClick}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  pushAllChangesFetchStatus: pushAllChangesFetchStatusSelector(state),
  includedCountsByEntityGroup: includedCountsByEntityGroupSelector(state),
  toolAction: toolActionSelector(state),
  transferCountsByEntityGroup: transferCountsByEntityGroupSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onCreateAllEntities: createAllEntities.request,
  onDeleteAllEntities: deleteAllEntities.request,
  onPush: push,
  onResetTransferCountsByEntityGroup: resetTransferCountsByEntityGroup,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PerformToolActionStepComponent);
