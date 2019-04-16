import React, { useEffect, useState } from 'react';
import { If, Then, Else, When } from 'react-if';
import { connect } from 'react-redux';
import { Container, Content, Title } from 'bloomer';
import { css } from 'emotion';
import { get, isNil } from 'lodash';
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
import {
  CompoundWorkspaceModel,
  NotificationModel,
  NotificationType,
  ReduxDispatch,
  ReduxState,
} from '~/types';

interface ConnectStateProps {
  areWorkspaceYearsFetched: boolean;
  countOfWorkspacesIncluded: number;
  workspaceIds: Array<string>;
  workspacesById: Record<string, CompoundWorkspaceModel>;
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

  const fetchWorkspaceSummaries = async () => {
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

    fetchWorkspaceSummaries();
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
    if (props.countOfWorkspacesIncluded === 0) {
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

  const isTransferrable = (() => {
    const totalIncludedYears = Object.values(props.workspacesById).reduce(
      (acc, workspace) => {
        const inclusionsByYear = get(workspace, 'inclusionsByYear', {});
        return acc + Object.keys(inclusionsByYear).length;
      },
      0,
    );
    return totalIncludedYears !== 0;
  })();

  return (
    <If condition={isNil(workspaceFetching)}>
      <Then>
        <When condition={isTransferrable}>
          <StepPage
            stepNumber={props.stepNumber}
            subtitle="Select Toggl Workspaces to Transfer"
            onPreviousClick={props.onPreviousClick}
            onNextClick={handleNextClick}
            onRefreshClick={fetchWorkspaceSummaries}
            instructions={
              <p>
                Select which workspaces and years you want to transfer to
                Clockify. All of them are included by default. Press the
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
        </When>
        <When condition={!isTransferrable}>
          <Container>
            <Title isSize={1}>This is awkward...</Title>
            <Content isSize="large">
              <p>
                It looks like you don&apos;t have any time entries in any of
                your workspaces. I appreciate your gusto but there isn&apos;t
                much I can do here.
              </p>
              <p>
                Maybe, by some incredibly unlikely chance, you put in some other
                person&apos;s API key that was like one letter off or something.
                That would also mean that you put in the wrong email address so
                kudos to you if you pulled that off.
              </p>
              <p>
                If that&apos;s the case, head back to the
                <a onClick={props.onPreviousClick}> credentials page </a>
                and take another whack at it. Also, buy a lottery ticket.
              </p>
            </Content>
          </Container>
        </When>
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
  countOfWorkspacesIncluded: selectTogglIncludedWorkspacesCount(state),
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
