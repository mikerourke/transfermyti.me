import React, { useEffect } from "react";
import { If, Then, Else, When } from "react-if";
import { connect } from "react-redux";
import { sortBy } from "lodash";
import { Container, Content, Title } from "bloomer";
import { css } from "emotion";
import {
  dismissAllNotifications,
  showNotification,
} from "~/redux/app/appActions";
import { updateAreCredentialsValid } from "~/redux/credentials/credentialsActions";
import {
  fetchTogglWorkspaces,
  flipIsWorkspaceIncluded,
} from "~/redux/entities/workspaces/workspacesActions";
import {
  selectIfWorkspacesFetching,
  selectTogglIncludedWorkspacesCount,
  selectTogglWorkspaces,
} from "~/redux/entities/workspaces/workspacesSelectors";
import Loader from "~/components/loader/Loader";
import StepPage, { StepPageProps } from "~/components/stepPage/StepPage";
import WorkspaceRow from "./components/WorkspaceRow";
import {
  CompoundWorkspaceModel,
  NotificationModel,
  NotificationType,
  ReduxDispatch,
  ReduxState,
} from "~/types";

interface ConnectStateProps {
  areWorkspacesFetching: boolean;
  countOfWorkspacesIncluded: number;
  workspaces: Array<CompoundWorkspaceModel>;
}

interface ConnectDispatchProps {
  onDismissAllNotifications: () => void;
  onFetchTogglWorkspaces: () => Promise<any>;
  onFlipIsWorkspaceIncluded: (workspaceId: string) => void;
  onResetAreCredentialsValid: () => void;
  onShowNotification: (notification: Partial<NotificationModel>) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const SelectTogglWorkspacesStepComponent: React.FC<Props> = props => {
  useEffect(() => {
    props.onFetchTogglWorkspaces();
  }, []);

  const handlePreviousClick = () => {
    props.onResetAreCredentialsValid();
    props.onPreviousClick();
  };

  const handleNextClick = () => {
    if (props.countOfWorkspacesIncluded === 0) {
      props.onShowNotification({
        message: "You must select at least one workspace",
        type: NotificationType.Error,
      });
    } else {
      props.onNextClick();
    }
  };

  const handleWorkspaceClick = (workspaceId: string) => {
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
              className={css`
                max-height: 50vh;
                overflow: auto;
                padding: 0.25rem;
              `}
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

const mapStateToProps = (state: ReduxState) => ({
  areWorkspacesFetching: selectIfWorkspacesFetching(state),
  countOfWorkspacesIncluded: selectTogglIncludedWorkspacesCount(state),
  workspaces: selectTogglWorkspaces(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onDismissAllNotifications: () => dispatch(dismissAllNotifications()),
  onFetchTogglWorkspaces: () => dispatch(fetchTogglWorkspaces()),
  onFlipIsWorkspaceIncluded: (workspaceId: string) =>
    dispatch(flipIsWorkspaceIncluded(workspaceId)),
  onResetAreCredentialsValid: () => dispatch(updateAreCredentialsValid(false)),
  onShowNotification: (notification: Partial<NotificationModel>) =>
    dispatch(showNotification(notification)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglWorkspacesStepComponent);
