import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { getEntityGroupDisplay } from "~/utils";
import {
  createAllEntities,
  resetTransferCountsByEntityGroup,
} from "~/allEntities/allEntitiesActions";
import {
  areEntitiesCreatingSelector,
  includedCountsByEntityGroupSelector,
  transferCountsByEntityGroupSelector,
} from "~/allEntities/allEntitiesSelectors";
import { Flex, HelpDetails, NavigationButtonsRow } from "~/components";
import ConfirmTransferModal from "./ConfirmTransferModal";
import ProgressBar from "./ProgressBar";
import TransferSuccess from "./TransferSuccess";
import {
  CountsByEntityGroupModel,
  EntityGroup,
} from "~/allEntities/allEntitiesTypes";
import { RoutePath } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

interface ConnectStateProps {
  areEntitiesCreating: boolean;
  includedCountsByEntityGroup: CountsByEntityGroupModel;
  transferCountsByEntityGroup: CountsByEntityGroupModel;
}

interface ConnectDispatchProps {
  onCreateAllEntities: PayloadActionCreator<string, void>;
  onPush: (path: Path) => void;
  onResetTransferCountsByEntityGroup: PayloadActionCreator<string, void>;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const PerformTransferStepComponent: React.FC<Props> = props => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState<boolean>(
    false,
  );
  const [wasTransferStarted, setWasTransferStarted] = React.useState<boolean>(
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
    if (wasTransferStarted && !props.areEntitiesCreating) {
    }
  }, [props.areEntitiesCreating]);

  const closeModal = (): void => setIsConfirmModalOpen(false);

  const handleBackClick = (): void => {
    props.onPush(RoutePath.SelectTransferData);
  };

  const handleNextClick = (): void => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmClick = (): void => {
    setIsConfirmModalOpen(false);
    setWasTransferStarted(true);
    props.onCreateAllEntities();
  };

  // TODO: Fix this so it shows if an error has occurred.
  if (wasTransferStarted && !props.areEntitiesCreating) {
    return <TransferSuccess />;
  }

  return (
    <section>
      <h1>Step 5: Perform Transfer</h1>
      <HelpDetails>
        <p>
          Press the <strong>Start Transfer</strong> button to start the
          transfer.
        </p>
        <p>Note: this could take several minutes due to API rate limiting.</p>
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
        disabled={props.areEntitiesCreating}
        nextLabel="Start Transfer"
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      />
      <ConfirmTransferModal
        isOpen={isConfirmModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirmClick}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  areEntitiesCreating: areEntitiesCreatingSelector(state),
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
)(PerformTransferStepComponent);
