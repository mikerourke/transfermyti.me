import { push } from "connected-react-router";
import { Path } from "history";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import {
  createAllEntities,
  resetTransferCountsByEntityGroup,
} from "~/allEntities/allEntitiesActions";
import {
  createAllFetchStatusSelector,
  includedCountsByEntityGroupSelector,
  transferCountsByEntityGroupSelector,
} from "~/allEntities/allEntitiesSelectors";
import {
  CountsByEntityGroupModel,
  EntityGroup,
  FetchStatus,
} from "~/allEntities/allEntitiesTypes";
import { RoutePath } from "~/app/appTypes";
import { Flex, HelpDetails, NavigationButtonsRow } from "~/components";
import { ReduxState } from "~/redux/reduxTypes";
import { getEntityGroupDisplay } from "~/utils";
import ConfirmToolActionModal from "./ConfirmToolActionModal";
import ProgressBar from "./ProgressBar";
import ToolActionSuccess from "./ToolActionSuccess";

interface ConnectStateProps {
  createAllFetchStatus: FetchStatus;
  includedCountsByEntityGroup: CountsByEntityGroupModel;
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

  // TODO: Fix this so it shows if an error has occurred.
  if (props.createAllFetchStatus === FetchStatus.Success) {
    return <ToolActionSuccess />;
  }

  return (
    <section>
      <h1>Step 5: Perform Transfer</h1>
      <HelpDetails>
        <p>
          Press the <strong>Start Transfer</strong> button and confirm the
          action in the dialog to begin the transfer.
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
        nextLabel="Start Transfer"
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      />
      <ConfirmToolActionModal
        isOpen={isConfirmModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmClick}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  createAllFetchStatus: createAllFetchStatusSelector(state),
  includedCountsByEntityGroup: includedCountsByEntityGroupSelector(state),
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
