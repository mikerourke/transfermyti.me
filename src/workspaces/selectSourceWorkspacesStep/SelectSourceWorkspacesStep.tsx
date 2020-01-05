import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { fetchAllEntities } from "~/allEntities/allEntitiesActions";
import { dismissAllNotifications, showNotification } from "~/app/appActions";
import Button from "~/components/Button";
import {
  fetchWorkspaces,
  flipIsWorkspaceIncluded,
} from "~/workspaces/workspacesActions";
import {
  areWorkspacesFetchingSelector,
  sourceIncludedWorkspacesCountSelector,
  sourceWorkspacesSelector,
} from "~/workspaces/workspacesSelectors";
import { Flex, HelpDetails, Loader, NavigationButtonsRow } from "~/components";
import NoWorkspacesModal from "./NoWorkspacesModal";
import SourceWorkspaceCard from "./SourceWorkspaceCard";
import { NotificationModel, RoutePath } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

interface ConnectStateProps {
  areWorkspacesFetching: boolean;
  includedWorkspacesCount: number;
  workspaces: WorkspaceModel[];
}

interface ConnectDispatchProps {
  onDismissAllNotifications: VoidFunction;
  onFetchAllEntities: PayloadActionCreator<string, void>;
  onFetchWorkspaces: PayloadActionCreator<string, void>;
  onFlipIsWorkspaceIncluded: (workspace: WorkspaceModel) => void;
  onPush: (path: Path) => void;
  onShowNotification: (notification: Partial<NotificationModel>) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const SelectSourceWorkspacesStepComponent: React.FC<Props> = props => {
  const [isErrorModalOpen, setIsErrorModalOpen] = React.useState<boolean>(
    false,
  );

  React.useEffect(() => {
    if (props.workspaces.length === 0) {
      props.onFetchWorkspaces();
    }
  }, []);

  const handleBackClick = (): void => {
    props.onPush(RoutePath.EnterApiKeys);
  };

  const handleNextClick = (): void => {
    if (props.includedWorkspacesCount === 0) {
      setIsErrorModalOpen(true);
      return;
    }

    props.onFetchAllEntities();
    props.onPush(RoutePath.SelectTransferData);
  };

  return (
    <>
      <section>
        <h1>Step 3: Select Source Workspaces</h1>
        <HelpDetails>
          Select which workspaces you would like to include in the transfer and
          press the <strong>Next</strong> button to move on to the source data
          selection step.
        </HelpDetails>
        {props.areWorkspacesFetching ? (
          <Loader>Loading workspaces, please wait...</Loader>
        ) : (
          <Flex as="ul" css={{ listStyle: "none", padding: 0 }}>
            {props.workspaces.map(workspace => (
              <SourceWorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onToggleIncluded={props.onFlipIsWorkspaceIncluded}
              />
            ))}
          </Flex>
        )}
        <NavigationButtonsRow
          disabled={props.areWorkspacesFetching}
          onBackClick={handleBackClick}
          onNextClick={handleNextClick}
        >
          <Button
            variant="outline"
            disabled={props.areWorkspacesFetching}
            onClick={() => () => props.onFetchWorkspaces()}
          >
            Refresh
          </Button>
        </NavigationButtonsRow>
      </section>
      <NoWorkspacesModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      />
    </>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  areWorkspacesFetching: areWorkspacesFetchingSelector(state),
  includedWorkspacesCount: sourceIncludedWorkspacesCountSelector(state),
  workspaces: sourceWorkspacesSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onDismissAllNotifications: dismissAllNotifications,
  onFetchAllEntities: fetchAllEntities.request,
  onFetchWorkspaces: fetchWorkspaces.request,
  onFlipIsWorkspaceIncluded: flipIsWorkspaceIncluded,
  onPush: push,
  onShowNotification: showNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectSourceWorkspacesStepComponent);
