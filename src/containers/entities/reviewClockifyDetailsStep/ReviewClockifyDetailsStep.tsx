import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { If, Then, Else } from 'react-if';
import { css } from 'emotion';
import {
  fetchClockifyEntitiesInWorkspace,
  fetchClockifyWorkspaces,
} from '~/redux/entities/workspaces/workspacesActions';
import {
  selectClockifyIncludedWorkspacesById,
  selectTogglCountsByGroupByWorkspace,
  selectTogglEntitiesByGroupByWorkspace,
  selectTogglIncludedWorkspacesById,
  selectWorkspaceNameBeingFetched,
} from '~/redux/entities/workspaces/workspacesSelectors';
import EntitiesReviewPage from '~/components/entitiesReviewPage/EntitiesReviewPage';
import Loader from '~/components/loader/Loader';
import { StepPageProps } from '~/components/stepPage/StepPage';
import InstructionsList from './components/InstructionsList';
import {
  CompoundWorkspaceModel,
  CountsByGroupByWorkspaceModel,
  EntitiesByGroupByWorkspaceModel,
  ReduxDispatch,
  ReduxState,
  ToolName,
} from '~/types';

interface ConnectStateProps {
  clockifyWorkspacesById: Record<string, CompoundWorkspaceModel>;
  togglCountsByGroupByWorkspace: CountsByGroupByWorkspaceModel;
  togglEntitiesByGroupByWorkspace: EntitiesByGroupByWorkspaceModel;
  togglWorkspacesById: Record<string, CompoundWorkspaceModel>;
  workspaceNameBeingFetched: string;
}

interface ConnectDispatchProps {
  onFetchClockifyEntitiesInWorkspace: (
    workspace: CompoundWorkspaceModel,
  ) => Promise<any>;
  onFetchClockifyWorkspaces: () => Promise<any>;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const ReviewClockifyDetailsStepComponent: React.FC<Props> = props => {
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const fetchClockifyEntitiesInAllWorkspaces = async () => {
    const workspaces = Object.values(props.clockifyWorkspacesById);
    if (workspaces.length === 0) return;

    for (const workspace of workspaces) {
      await props.onFetchClockifyEntitiesInWorkspace(workspace);
    }
  };

  useEffect(() => {
    props
      .onFetchClockifyWorkspaces()
      .then(fetchClockifyEntitiesInAllWorkspaces)
      .then(() => setIsFetching(false))
      .catch(() => setIsFetching(false));
  }, []);

  return (
    <If condition={isFetching}>
      <Then>
        <Loader>Fetching Clockify entities, please wait...</Loader>
      </Then>
      <Else>
        <EntitiesReviewPage
          stepNumber={props.stepNumber}
          subtitle="Review Pending Data Before Transfer"
          toolName={ToolName.Clockify}
          entitiesByGroupByWorkspace={props.togglEntitiesByGroupByWorkspace}
          countsByGroupByWorkspace={props.togglCountsByGroupByWorkspace}
          workspacesById={props.togglWorkspacesById}
          onPreviousClick={props.onPreviousClick}
          onNextClick={props.onNextClick}
          onRefreshClick={fetchClockifyEntitiesInAllWorkspaces}
          instructions={
            <>
              <p
                className={css`
                  margin-bottom: 1rem;
                `}
              >
                This page contains all the records that <strong>will</strong> be
                created on Clockify. Press <strong>Next</strong> to move to the
                final step.
              </p>
              <p
                className={css`
                  color: var(--info);
                  font-weight: bold;
                  margin-bottom: 1rem;
                `}
              >
                The transfer will not start until you confirm it on the next
                page.
              </p>
              <InstructionsList />
            </>
          }
        />
      </Else>
    </If>
  );
};

const mapStateToProps = (state: ReduxState) => ({
  clockifyWorkspacesById: selectClockifyIncludedWorkspacesById(state),
  togglEntitiesByGroupByWorkspace: selectTogglEntitiesByGroupByWorkspace(state),
  togglCountsByGroupByWorkspace: selectTogglCountsByGroupByWorkspace(state),
  togglWorkspacesById: selectTogglIncludedWorkspacesById(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchClockifyEntitiesInWorkspace: (workspace: CompoundWorkspaceModel) =>
    dispatch(fetchClockifyEntitiesInWorkspace(workspace)),
  onFetchClockifyWorkspaces: () => dispatch(fetchClockifyWorkspaces()),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ReviewClockifyDetailsStepComponent);
