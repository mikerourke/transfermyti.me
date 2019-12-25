import React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Else, If, Then } from "react-if";
import { FlexboxGrid } from "rsuite";
import { Path } from "history";
import { PayloadActionCreator } from "typesafe-actions";
import { dismissAllNotifications, showNotification } from "~/app/appActions";
import {
  fetchWorkspaces,
  flipIsWorkspaceIncluded,
} from "~/workspaces/workspacesActions";
import {
  selectIfWorkspacesFetching,
  selectSourceIncludedWorkspacesCount,
  selectSourceWorkspaces,
} from "~/workspaces/workspacesSelectors";
import { HelpMessage, Loader, NavigationButtonsRow } from "~/components";
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
    props.onPush(RoutePath.ReviewSource);
  };

  return (
    <div>
      <HelpMessage title="Source Workspaces">
        Select which workspaces you would like to include in the transfer and
        press the <strong>Next</strong> button to move on to the source data
        selection step.
      </HelpMessage>
      <If condition={props.areWorkspacesFetching}>
        <Then>
          <Loader css={{ margin: "3rem 1rem" }}>
            Loading workspaces, please wait...
          </Loader>
        </Then>
        <Else>
          <FlexboxGrid css={{ marginTop: "1rem" }}>
            {props.workspaces.map(workspace => (
              <SourceWorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onToggleIncluded={props.onFlipIsWorkspaceIncluded}
              />
            ))}
          </FlexboxGrid>
        </Else>
      </If>
      <NavigationButtonsRow
        css={{ marginTop: "1rem" }}
        onBackClick={handleBackClick}
        onNextClick={handleNextClick}
        onRefreshClick={() => props.onFetchWorkspaces()}
      />
    </div>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  areWorkspacesFetching: selectIfWorkspacesFetching(state),
  countOfWorkspacesIncluded: selectSourceIncludedWorkspacesCount(state),
  workspaces: selectSourceWorkspaces(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onDismissAllNotifications: dismissAllNotifications,
  onFetchWorkspaces: fetchWorkspaces.request,
  onFlipIsWorkspaceIncluded: flipIsWorkspaceIncluded,
  onPush: push,
  onShowNotification: showNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectSourceWorkspacesStepComponent);
