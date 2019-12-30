import React from "react";
import { push } from "connected-react-router";
import { Path } from "history";
import { connect } from "react-redux";
import { PayloadActionCreator } from "typesafe-actions";
import { fetchAllEntities } from "~/allEntities/allEntitiesActions";
import { dismissAllNotifications, showNotification } from "~/app/appActions";
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
import SourceWorkspaceCard from "./SourceWorkspaceCard";
import { RoutePath, NotificationModel } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

interface ConnectStateProps {
  areWorkspacesFetching: boolean;
  countOfWorkspacesIncluded: number;
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
  React.useEffect(() => {
    if (props.workspaces.length === 0) {
      props.onFetchWorkspaces();
    }
  }, []);

  const handleBackClick = (): void => {
    props.onPush(RoutePath.Credentials);
  };

  const handleNextClick = (): void => {
    props.onFetchAllEntities();
    props.onPush(RoutePath.ReviewSource);
  };

  return (
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
        onRefreshClick={() => props.onFetchWorkspaces()}
      />
    </section>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  areWorkspacesFetching: areWorkspacesFetchingSelector(state),
  countOfWorkspacesIncluded: sourceIncludedWorkspacesCountSelector(state),
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
