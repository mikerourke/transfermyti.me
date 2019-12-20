import React, { useEffect } from "react";
import { If, Then, Else, When } from "react-if";
import { connect } from "react-redux";
import { sortBy } from "lodash";
import { Container, Content, Title } from "bloomer";
import { css } from "emotion";
import { dismissAllNotifications, showNotification } from "~/app/appActions";
import { updateAreCredentialsValid } from "~/credentials/credentialsActions";
import {
  fetchTogglWorkspaces,
  flipIsWorkspaceIncluded,
} from "~/workspaces/workspacesActions";
import {
  selectIfWorkspacesFetching,
  selectTogglIncludedWorkspacesCount,
  selectTogglWorkspaces,
} from "~/workspaces/workspacesSelectors";
import { Loader, StepPage, StepPageProps } from "~/components";
import WorkspaceRow from "./WorkspaceRow";
import { NotificationModel, NotificationType } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { CompoundWorkspaceModel } from "~/workspaces/workspacesTypes";

interface ConnectStateProps {
  areWorkspacesFetching: boolean;
  countOfWorkspacesIncluded: number;
  workspaces: Array<CompoundWorkspaceModel>;
}

interface ConnectDispatchProps {
  onDismissAllNotifications: () => void;
  onFetchTogglWorkspaces: () => void;
  onFlipIsWorkspaceIncluded: (workspaceId: string) => void;
  onUpdateAreCredentialsValid: (areValid: boolean) => void;
  onShowNotification: (notification: Partial<NotificationModel>) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const SelectTogglWorkspacesStepComponent: React.FC<Props> = props => {
  useEffect(() => {
    props.onFetchTogglWorkspaces();
  }, []);

  const handlePreviousClick = (): void => {
    props.onUpdateAreCredentialsValid(false);
    props.onPreviousClick();
  };

  const handleNextClick = (): void => {
    if (props.countOfWorkspacesIncluded === 0) {
      props.onShowNotification({
        message: "You must select at least one workspace",
        type: NotificationType.Error,
      });
    } else {
      props.onNextClick();
    }
  };

  const handleWorkspaceClick = (workspaceId: string): void => {
    props.onFlipIsWorkspaceIncluded(workspaceId);
    props.onDismissAllNotifications();
  };

  const isTransferrable = props.workspaces.length !== 0;
  const sortedWorkspaces = sortBy(props.workspaces, ["name"]);

  return (
    <If condition={!props.areWorkspacesFetching}>
      <Then>
        <When condition={isTransferrable}>
          <StepPage
            stepNumber={props.stepNumber}
            subtitle="Select Toggl Workspaces to Transfer"
            onPreviousClick={handlePreviousClick}
            onNextClick={handleNextClick}
            onRefreshClick={props.onFetchTogglWorkspaces}
            instructions={
              <p>
                Select which workspaces you want to transfer to Clockify. All of
                them are included by default. Press the
                <strong> Next</strong> button when you&apos;re ready to move
                onto the next step.
              </p>
            }
          >
            <Container
              className={css({
                maxHeight: "50vh",
                overflow: "auto",
                padding: "0.25rem",
              })}
            >
              {sortedWorkspaces.map(workspace => (
                <WorkspaceRow
                  key={workspace.id}
                  workspace={workspace}
                  onWorkspaceClick={handleWorkspaceClick}
                />
              ))}
            </Container>
          </StepPage>
        </When>
        <When condition={!isTransferrable}>
          <Container>
            <Title isSize={1}>This is awkward...</Title>
            <Content isSize="large">
              <p>
                It looks like you don&apos;t have any workspaces setup on Toggl.
              </p>
              <p>This tool is officially useless for you. Bummer :(.</p>
            </Content>
          </Container>
        </When>
      </Then>
      <Else>
        <Loader>Fetching workspaces...</Loader>
      </Else>
    </If>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  areWorkspacesFetching: selectIfWorkspacesFetching(state),
  countOfWorkspacesIncluded: selectTogglIncludedWorkspacesCount(state),
  workspaces: selectTogglWorkspaces(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onDismissAllNotifications: dismissAllNotifications,
  onFetchTogglWorkspaces: fetchTogglWorkspaces,
  onFlipIsWorkspaceIncluded: flipIsWorkspaceIncluded,
  onUpdateAreCredentialsValid: updateAreCredentialsValid,
  onShowNotification: showNotification,
};

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglWorkspacesStepComponent);
