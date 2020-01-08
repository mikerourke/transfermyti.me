import { push } from "connected-react-router";
import { Path } from "history";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { capitalize, getEntityGroupDisplay } from "~/utils";
import {
  createAllEntities,
  resetTransferCountsByEntityGroup,
} from "~/allEntities/allEntitiesActions";
import {
  createAllFetchStatusSelector,
  includedCountsByEntityGroupSelector,
  transferCountsByEntityGroupSelector,
} from "~/allEntities/allEntitiesSelectors";
import { toolActionSelector } from "~/app/appSelectors";
import { Flex, HelpDetails, NavigationButtonsRow } from "~/components";
import ConfirmToolActionModal from "./ConfirmToolActionModal";
import ProgressBar from "./ProgressBar";
import {
  CountsByEntityGroupModel,
  EntityGroup,
  FetchStatus,
} from "~/allEntities/allEntitiesTypes";
import { RoutePath, ToolAction } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  createAllFetchStatus: FetchStatus;
  includedCountsByEntityGroup: CountsByEntityGroupModel;
  toolAction: ToolAction;
  transferCountsByEntityGroup: CountsByEntityGroupModel;
}

interface ConnectDispatchProps {
  onCreateAllEntities: PayloadActionCreator<string, void>;
  onPush: (path: Path) => void;
  onResetTransferCountsByEntityGroup: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const PerformToolActionStepComponent: React.FC<Props> = props => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(
    false,
  );
  const [
    totalCountsByEntityGroup,
    setTotalCountsByEntityGroup,
  ] = React.useState<CountsByEntityGroupModel>({} as CountsByEntityGroupModel);

  React.useEffect(() => {
    props.onResetTransferCountsByEntityGroup();
    setTotalCountsByEntityGroup(props.includedCountsByEntityGroup);
  }, []);

  React.useEffect(() => {
    // TODO: Fix this so it shows if an error has occurred.
    if (props.createAllFetchStatus === FetchStatus.Success) {
      props.onPush(RoutePath.ToolActionSuccess);
    }
  }, [props.createAllFetchStatus]);

  const closeModal = (): void => setIsConfirmModalOpen(false);

  const handleBackClick = (): void => {
    props.onPush(RoutePath.SelectInclusions);
  };

  const handleNextClick = (): void => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmClick = (): void => {
    setIsConfirmModalOpen(false);
    props.onCreateAllEntities();
  };

  const actionDisplay = capitalize(props.toolAction);
  const title =
    props.toolAction === ToolAction.None
      ? "Perform Action"
      : `Perform ${capitalize(props.toolAction)} Action`;

  return (
    <section>
      <h1>Step 5: {title}</h1>
      <HelpDetails>
        <p>
          Press the <strong>Start</strong> button and confirm the action in the
          dialog.
        </p>
        <p>
          <strong>
            Note: this could take several minutes due to API rate limiting.
          </strong>
        </p>
      </HelpDetails>
      <Flex direction="column">
        {Object.keys(totalCountsByEntityGroup).map(entityGroup => (
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
        disabled={props.createAllFetchStatus === FetchStatus.InProcess}
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
  createAllFetchStatus: createAllFetchStatusSelector(state),
  includedCountsByEntityGroup: includedCountsByEntityGroupSelector(state),
  toolAction: toolActionSelector(state),
  transferCountsByEntityGroup: transferCountsByEntityGroupSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onCreateAllEntities: createAllEntities.request,
  onPush: push,
  onResetTransferCountsByEntityGroup: resetTransferCountsByEntityGroup,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PerformToolActionStepComponent);
