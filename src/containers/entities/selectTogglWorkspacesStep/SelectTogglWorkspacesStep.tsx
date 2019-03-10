import React from 'react';
import { connect } from 'react-redux';
import { Container } from 'bloomer';
import { css } from 'emotion';
import {
  dismissAllNotifications,
  showNotification,
} from '~/redux/app/appActions';
import {
  fetchTogglWorkspaceSummary,
  updateIsWorkspaceIncluded,
  updateIsWorkspaceYearIncluded,
} from '~/redux/entities/workspaces/workspacesActions';
import {
  selectTogglIncludedWorkspacesCount,
  selectTogglWorkspaceIds,
  selectTogglWorkspacesById,
  selectTogglWorkspaceIncludedYearsCount,
  selectIfTogglWorkspaceYearsFetched,
} from '~/redux/entities/workspaces/workspacesSelectors';
import Loader from '~/components/loader/Loader';
import StepPage from '~/components/stepPage/StepPage';
import WorkspaceRow from './components/WorkspaceRow';
import { NotificationModel, NotificationType } from '~/types/appTypes';
import { ReduxDispatch, ReduxState } from '~/types/commonTypes';
import { WorkspaceModel } from '~/types/workspacesTypes';

interface ConnectStateProps {
  workspaceIds: string[];
  workspacesById: Record<string, WorkspaceModel>;
  areWorkspaceYearsFetched: boolean;
  countWorkspacesIncluded: number;
  yearsCountByWorkspaceId: Record<string, number>;
}

interface ConnectDispatchProps {
  onFetchWorkspaceSummary: (workspaceId: string) => Promise<any>;
  onUpdateIsWorkspaceIncluded: (workspaceId: string) => void;
  onUpdateIsWorkspaceYearIncluded: (workspaceId: string, year: string) => void;
  onShowNotification: (notification: Partial<NotificationModel>) => void;
  onDismissAllNotifications: () => void;
}

interface OwnProps {
  previous: () => void;
  next: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & OwnProps;

interface State {
  workspaceFetching: string | null;
}

export class SelectTogglWorkspacesStepComponent extends React.Component<
  Props,
  State
> {
  state: State = {
    workspaceFetching: null,
  };

  public componentDidMount() {
    // Don't re-fetch if workspaces have already been fetched:
    if (this.props.areWorkspaceYearsFetched) return;

    this.loadWorkspaceSummaries().then(() => {
      this.setState({ workspaceFetching: null });
    });
  }

  private loadWorkspaceSummaries = async () => {
    for (const workspaceId of this.props.workspaceIds) {
      const workspace = this.props.workspacesById[workspaceId];
      this.setState({ workspaceFetching: workspace.name });
      await this.props.onFetchWorkspaceSummary(workspaceId);
    }
  };

  private handleNextClick = () => {
    if (this.props.countWorkspacesIncluded === 0) {
      this.props.onShowNotification({
        message: 'You must select at least one workspace',
        type: NotificationType.Error,
      });
    } else {
      this.props.next();
    }
  };

  private handleWorkspaceClick = (workspaceId: string) => {
    const workspace = this.props.workspacesById[workspaceId];
    const wasWorkspaceIncluded = workspace.isIncluded;

    this.props.onUpdateIsWorkspaceIncluded(workspaceId);
    Object.entries(workspace.inclusionsByYear).forEach(([year, isIncluded]) => {
      if (isIncluded === wasWorkspaceIncluded) {
        this.props.onUpdateIsWorkspaceYearIncluded(workspaceId, year);
      }
    });

    this.props.onDismissAllNotifications();
  };

  private handleYearClick = (workspaceId: string, year: string) => {
    const workspace = this.props.workspacesById[workspaceId];
    this.props.onUpdateIsWorkspaceYearIncluded(workspaceId, year);

    setTimeout(() => {
      const includedCount = this.props.yearsCountByWorkspaceId[workspaceId];
      if (
        (includedCount === 0 && workspace.isIncluded) ||
        (includedCount > 0 && !workspace.isIncluded)
      ) {
        this.props.onUpdateIsWorkspaceIncluded(workspaceId);
      }
    });
  };

  public render() {
    const { workspaceFetching } = this.state;
    if (workspaceFetching !== null) {
      return (
        <Loader>
          Determining years for <strong>{workspaceFetching} </strong>
          workspace...
        </Loader>
      );
    }

    return (
      <StepPage
        title="Step 3:"
        subtitle="Select Toggl Workspaces to Transfer"
        previous={this.props.previous}
        next={this.handleNextClick}
      >
        <p
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          Select which workspaces and years you want to transfer to Clockify.
          All of them are included by default. Press the <strong>Next </strong>
          button when you're ready to proceed.
        </p>
        <Container
          className={css`
            max-height: 50vh;
            overflow: auto;
            padding: 1rem;
          `}
        >
          {this.props.workspaceIds.map(workspaceId => (
            <WorkspaceRow
              key={workspaceId}
              workspaceRecord={this.props.workspacesById[workspaceId]}
              onWorkspaceClick={this.handleWorkspaceClick}
              onYearClick={this.handleYearClick}
            />
          ))}
        </Container>
      </StepPage>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  workspaceIds: selectTogglWorkspaceIds(state),
  workspacesById: selectTogglWorkspacesById(state),
  areWorkspaceYearsFetched: selectIfTogglWorkspaceYearsFetched(state),
  countWorkspacesIncluded: selectTogglIncludedWorkspacesCount(state),
  yearsCountByWorkspaceId: selectTogglWorkspaceIncludedYearsCount(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchWorkspaceSummary: (workspaceId: string) =>
    dispatch(fetchTogglWorkspaceSummary(workspaceId)),
  onUpdateIsWorkspaceIncluded: (workspaceId: string) =>
    dispatch(updateIsWorkspaceIncluded(workspaceId)),
  onUpdateIsWorkspaceYearIncluded: (workspaceId: string, year: string) =>
    dispatch(updateIsWorkspaceYearIncluded({ workspaceId, year })),
  onShowNotification: (notification: Partial<NotificationModel>) =>
    dispatch(showNotification(notification)),
  onDismissAllNotifications: () => dispatch(dismissAllNotifications()),
});

export default connect<ConnectStateProps, ConnectDispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglWorkspacesStepComponent);
