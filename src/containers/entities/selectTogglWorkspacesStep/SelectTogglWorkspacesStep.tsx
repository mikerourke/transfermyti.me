import React, { useEffect, useState } from 'react';
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
  selectIfTogglWorkspaceYearsFetched,
  selectTogglIncludedWorkspacesCount,
  selectTogglWorkspaceIds,
  selectTogglWorkspaceIncludedYearsCount,
  selectTogglWorkspacesById,
} from '~/redux/entities/workspaces/workspacesSelectors';
import Loader from '~/components/loader/Loader';
import StepPage, { StepPageProps } from '~/components/stepPage/StepPage';
import WorkspaceRow from './components/WorkspaceRow';
import { NotificationModel, NotificationType } from '~/types/appTypes';
import { ReduxDispatch, ReduxState } from '~/types/commonTypes';
import { WorkspaceModel } from '~/types/workspacesTypes';

interface ConnectStateProps {
  areWorkspaceYearsFetched: boolean;
  countWorkspacesIncluded: number;
  workspaceIds: string[];
  workspacesById: Record<string, WorkspaceModel>;
  yearsCountByWorkspaceId: Record<string, number>;
}

interface ConnectDispatchProps {
  onDismissAllNotifications: () => void;
  onFetchWorkspaceSummary: (workspaceId: string) => Promise<any>;
  onShowNotification: (notification: Partial<NotificationModel>) => void;
  onUpdateIsWorkspaceIncluded: (workspaceId: string) => void;
  onUpdateIsWorkspaceYearIncluded: (workspaceId: string, year: string) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const SelectTogglWorkspacesStepComponent: React.FC<Props> = props => {
  const [workspaceFetching, setWorkspaceFetching] = useState<string | null>(
    null,
  );

  const loadWorkspaceSummaries = async () => {
    for (const workspaceId of props.workspaceIds) {
      const workspace = props.workspacesById[workspaceId];
      setWorkspaceFetching(workspace.name);
      await props.onFetchWorkspaceSummary(workspaceId);
    }
  };

  useEffect(() => {
    // Don't re-fetch if workspaces have already been fetched:
    if (props.areWorkspaceYearsFetched) return;

    loadWorkspaceSummaries().then(() => {
      setWorkspaceFetching(null);
    });
  }, [props.areWorkspaceYearsFetched]);

  const handleNextClick = () => {
    if (props.countWorkspacesIncluded === 0) {
      props.onShowNotification({
        message: 'You must select at least one workspace',
        type: NotificationType.Error,
      });
    } else {
      props.next();
    }
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    const workspace = props.workspacesById[workspaceId];
    const wasWorkspaceIncluded = workspace.isIncluded;

    props.onUpdateIsWorkspaceIncluded(workspaceId);
    Object.entries(workspace.inclusionsByYear).forEach(([year, isIncluded]) => {
      if (isIncluded === wasWorkspaceIncluded) {
        props.onUpdateIsWorkspaceYearIncluded(workspaceId, year);
      }
    });

    props.onDismissAllNotifications();
  };

  const handleYearClick = (workspaceId: string, year: string) => {
    const workspace = props.workspacesById[workspaceId];
    props.onUpdateIsWorkspaceYearIncluded(workspaceId, year);

    setTimeout(() => {
      const includedCount = props.yearsCountByWorkspaceId[workspaceId];
      if (
        (includedCount === 0 && workspace.isIncluded) ||
        (includedCount > 0 && !workspace.isIncluded)
      ) {
        props.onUpdateIsWorkspaceIncluded(workspaceId);
      }
    });
  };

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
      stepNumber={props.stepNumber}
      subtitle="Select Toggl Workspaces to Transfer"
      previous={props.previous}
      next={handleNextClick}
    >
      <p
        className={css`
          margin-bottom: 1.25rem;
        `}
      >
        Select which workspaces and years you want to transfer to Clockify. All
        of them are included by default. Press the <strong>Next </strong>
        button when you're ready to proceed.
      </p>
      <Container
        className={css`
          max-height: 50vh;
          overflow: auto;
          padding: 1rem;
        `}
      >
        {props.workspaceIds.map(workspaceId => (
          <WorkspaceRow
            key={workspaceId}
            workspaceRecord={props.workspacesById[workspaceId]}
            onWorkspaceClick={handleWorkspaceClick}
            onYearClick={handleYearClick}
          />
        ))}
      </Container>
    </StepPage>
  );
};

const mapStateToProps = (state: ReduxState) => ({
  areWorkspaceYearsFetched: selectIfTogglWorkspaceYearsFetched(state),
  countWorkspacesIncluded: selectTogglIncludedWorkspacesCount(state),
  workspaceIds: selectTogglWorkspaceIds(state),
  workspacesById: selectTogglWorkspacesById(state),
  yearsCountByWorkspaceId: selectTogglWorkspaceIncludedYearsCount(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onDismissAllNotifications: () => dispatch(dismissAllNotifications()),
  onFetchWorkspaceSummary: (workspaceId: string) =>
    dispatch(fetchTogglWorkspaceSummary(workspaceId)),
  onShowNotification: (notification: Partial<NotificationModel>) =>
    dispatch(showNotification(notification)),
  onUpdateIsWorkspaceIncluded: (workspaceId: string) =>
    dispatch(updateIsWorkspaceIncluded(workspaceId)),
  onUpdateIsWorkspaceYearIncluded: (workspaceId: string, year: string) =>
    dispatch(
      updateIsWorkspaceYearIncluded({
        workspaceId,
        year,
      }),
    ),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglWorkspacesStepComponent);
