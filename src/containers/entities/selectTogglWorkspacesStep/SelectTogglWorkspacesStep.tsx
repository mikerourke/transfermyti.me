import React, { useEffect, useState } from 'react';
import { If, Then, Else } from 'react-if';
import { connect } from 'react-redux';
import { Container } from 'bloomer';
import { css } from 'emotion';
import { isNil } from 'lodash';
import {
  dismissAllNotifications,
  showNotification,
} from '~/redux/app/appActions';
import {
  fetchTogglWorkspaceSummary,
  flipIsWorkspaceIncluded,
  flipIsWorkspaceYearIncluded,
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
  workspaceIds: Array<string>;
  workspacesById: Record<string, WorkspaceModel>;
  yearsCountByWorkspaceId: Record<string, number>;
}

interface ConnectDispatchProps {
  onDismissAllNotifications: () => void;
  onFetchWorkspaceSummary: (workspaceId: string) => Promise<any>;
  onFlipIsWorkspaceIncluded: (workspaceId: string) => void;
  onFlipIsWorkspaceYearIncluded: (workspaceId: string, year: string) => void;
  onShowNotification: (notification: Partial<NotificationModel>) => void;
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
      setWorkspaceFetching(null);
    }
  };

  useEffect(() => {
    // Don't re-fetch if workspaces have already been fetched:
    if (props.areWorkspaceYearsFetched) return;

    loadWorkspaceSummaries();
  }, [props.areWorkspaceYearsFetched]);

  const validateWorkspaceInclusionByYears = (workspaceId: string) => {
    const workspace = props.workspacesById[workspaceId];

    const includedCount = props.yearsCountByWorkspaceId[workspaceId];
    if (
      (includedCount === 0 && workspace.isIncluded) ||
      (includedCount > 0 && !workspace.isIncluded)
    ) {
      props.onFlipIsWorkspaceIncluded(workspaceId);
    }
  };

  const validateWorkspaceInclusions = () => {
    props.workspaceIds.forEach(workspaceId => {
      validateWorkspaceInclusionByYears(workspaceId);
    });
  };

  const handleNextClick = () => {
    if (props.countWorkspacesIncluded === 0) {
      props.onShowNotification({
        message: 'You must select at least one workspace',
        type: NotificationType.Error,
      });
    } else {
      validateWorkspaceInclusions();
      props.onNextClick();
    }
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    const workspace = props.workspacesById[workspaceId];
    const wasWorkspaceIncluded = workspace.isIncluded;

    props.onFlipIsWorkspaceIncluded(workspaceId);
    Object.entries(workspace.inclusionsByYear).forEach(([year, isIncluded]) => {
      if (isIncluded === wasWorkspaceIncluded) {
        props.onFlipIsWorkspaceYearIncluded(workspaceId, year);
      }
    });

    props.onDismissAllNotifications();
  };

  const handleYearClick = (workspaceId: string, year: string) => {
    props.onFlipIsWorkspaceYearIncluded(workspaceId, year);

    setTimeout(() => {
      validateWorkspaceInclusionByYears(workspaceId);
    });
  };

  return (
    <If condition={isNil(workspaceFetching)}>
      <Then>
        <StepPage
          stepNumber={props.stepNumber}
          subtitle="Select Toggl Workspaces to Transfer"
          onPreviousClick={props.onPreviousClick}
          onNextClick={handleNextClick}
          onRefreshClick={loadWorkspaceSummaries}
          instructions={
            <p>
              Select which workspaces and years you want to transfer to
              Clockify. All of them are included by default. Press the
              <strong> Next</strong> button when you're ready to move onto the
              next step.
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
      </Then>
      <Else>
        <Loader>
          Determining years for <strong>{workspaceFetching} </strong>
          workspace...
        </Loader>
      </Else>
    </If>
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
  onFlipIsWorkspaceIncluded: (workspaceId: string) =>
    dispatch(flipIsWorkspaceIncluded(workspaceId)),
  onFlipIsWorkspaceYearIncluded: (workspaceId: string, year: string) =>
    dispatch(
      flipIsWorkspaceYearIncluded({
        workspaceId,
        year,
      }),
    ),
  onShowNotification: (notification: Partial<NotificationModel>) =>
    dispatch(showNotification(notification)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglWorkspacesStepComponent);
