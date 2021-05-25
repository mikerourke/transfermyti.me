import { push } from "connected-react-router";
import React from "react";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";

import ActiveWorkspaceSelect from "./ActiveWorkspaceSelect";
import InclusionsPanelsAccordion from "./InclusionsPanelsAccordion";
import NoSelectionsModal from "./NoSelectionsModal";
import SelectInclusionsHelpByAction from "./SelectInclusionsHelpByAction";
import ShowExistingToggle from "./ShowExistingToggle";
import {
  fetchAllEntities,
  flipIfExistsInTargetShown,
} from "~/allEntities/allEntitiesActions";
import {
  areExistsInTargetShownSelector,
  entityGroupInProcessDisplaySelector,
  fetchAllFetchStatusSelector,
  toolActionSelector,
  totalIncludedRecordsCountSelector,
} from "~/allEntities/allEntitiesSelectors";
import {
  Button,
  Loader,
  LoadingMessage,
  NavigationButtonsRow,
} from "~/components";
import { FetchStatus, ReduxState, RoutePath, ToolAction } from "~/typeDefs";
import { capitalize } from "~/utils";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";

interface ConnectStateProps {
  activeWorkspaceId: string;
  areExistsInTargetShown: boolean;
  entityGroupInProcessDisplay: string;
  fetchAllFetchStatus: FetchStatus;
  toolAction: ToolAction;
  totalIncludedRecordsCount: number;
}

interface ConnectDispatchProps {
  onFetchAllEntities: PayloadActionCreator<string, void>;
  onFlipIfExistsInTargetShown: PayloadActionCreator<string, void>;
  onPush: (path: RoutePath) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const SelectInclusionsStepComponent: React.FC<Props> = (props) => {
  const [isErrorModalOpen, setIsErrorModalOpen] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (props.fetchAllFetchStatus === FetchStatus.Pending) {
      props.onFetchAllEntities();
    }

    if (!props.areExistsInTargetShown) {
      props.onFlipIfExistsInTargetShown();
    }
  }, []);

  const handleBackClick = (): void => {
    props.onPush(RoutePath.SelectWorkspaces);
  };

  const handleNextClick = (): void => {
    if (props.totalIncludedRecordsCount === 0) {
      setIsErrorModalOpen(true);
    } else {
      props.onPush(RoutePath.PerformToolAction);
    }
  };

  const handleRefreshClick = (): void => {
    props.onFetchAllEntities();
  };

  const handleShowExistingToggle = (): void => {
    props.onFlipIfExistsInTargetShown();
  };

  const handleCloseModal = (): void => {
    setIsErrorModalOpen(false);
  };

  return (
    <section>
      <h1>Step 4: Select Records to {capitalize(props.toolAction)}</h1>
      <SelectInclusionsHelpByAction toolAction={props.toolAction} />
      {props.fetchAllFetchStatus === FetchStatus.Success ? (
        <>
          <ActiveWorkspaceSelect />
          {props.toolAction === ToolAction.Transfer && (
            <ShowExistingToggle
              isToggled={props.areExistsInTargetShown}
              onToggle={handleShowExistingToggle}
            />
          )}
          <InclusionsPanelsAccordion />
        </>
      ) : (
        <>
          <Loader />
          <LoadingMessage>
            Fetching {props.entityGroupInProcessDisplay}, please wait...
          </LoadingMessage>
        </>
      )}
      <NavigationButtonsRow
        disabled={props.fetchAllFetchStatus === FetchStatus.InProcess}
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
      >
        <Button
          disabled={props.fetchAllFetchStatus === FetchStatus.InProcess}
          variant="eggplant"
          onClick={handleRefreshClick}
        >
          Refresh
        </Button>
      </NavigationButtonsRow>
      <NoSelectionsModal
        isOpen={isErrorModalOpen}
        toolAction={props.toolAction}
        onClose={handleCloseModal}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  activeWorkspaceId: activeWorkspaceIdSelector(state),
  areExistsInTargetShown: areExistsInTargetShownSelector(state),
  entityGroupInProcessDisplay: entityGroupInProcessDisplaySelector(state),
  fetchAllFetchStatus: fetchAllFetchStatusSelector(state),
  toolAction: toolActionSelector(state),
  totalIncludedRecordsCount: totalIncludedRecordsCountSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onFetchAllEntities: fetchAllEntities.request,
  onFlipIfExistsInTargetShown: flipIfExistsInTargetShown,
  onPush: push,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectInclusionsStepComponent);
