import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { If, Then, Else, When } from 'react-if';
import { css } from 'emotion';
import {
  fetchClockifyEntitiesInWorkspace,
  fetchClockifyWorkspaces,
  transferEntitiesToClockifyWorkspace,
} from '~/redux/entities/workspaces/workspacesActions';
import {
  selectClockifyIncludedWorkspacesById,
  selectTogglIncludedWorkspacesById,
  selectTogglInclusionsByWorkspaceId,
  selectWorkspaceNameBeingFetched,
} from '~/redux/entities/workspaces/workspacesSelectors';
import EntitiesReviewPage from '~/components/entitiesReviewPage/EntitiesReviewPage';
import Loader from '~/components/loader/Loader';
import ConfirmationModal from './components/ConfirmationModal';
import { EntityModel, ReduxDispatch, ReduxState } from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';
import { WorkspaceModel } from '~/types/workspacesTypes';
import { StepPageProps } from '~/components/stepPage/StepPage';

interface ConnectStateProps {
  clockifyWorkspacesById: Record<string, WorkspaceModel>;
  togglInclusionsByWorkspaceId: Record<
    string,
    Record<EntityGroup, EntityModel[]>
  >;
  togglWorkspacesById: Record<string, WorkspaceModel>;
  workspaceNameBeingFetched: string;
}

interface ConnectDispatchProps {
  onFetchClockifyEntitiesInWorkspace: (
    workspaceRecord: WorkspaceModel,
  ) => Promise<any>;
  onFetchClockifyWorkspaces: () => Promise<any>;
  onTransferEntitiesToClockifyWorkspace: (
    workspaceRecord: WorkspaceModel,
  ) => Promise<any>;
}

type Props = ConnectStateProps & ConnectDispatchProps & StepPageProps;

export const ReviewClockifyDetailsStepComponent: React.FC<Props> = props => {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [isModalActive, setIsModalActive] = useState<boolean>(false);

  const fetchClockifyEntitiesInAllWorkspaces = async () => {
    const workspaceRecords = Object.values(props.clockifyWorkspacesById);
    if (workspaceRecords.length === 0) return Promise.resolve();

    for (const workspaceRecord of workspaceRecords) {
      await props.onFetchClockifyEntitiesInWorkspace(workspaceRecord);
    }
  };

  useEffect(() => {
    props
      .onFetchClockifyWorkspaces()
      .then(fetchClockifyEntitiesInAllWorkspaces)
      .then(() => setIsFetching(false))
      .catch(() => setIsFetching(false));
  }, []);

  const handleNextClick = (): void => {
    setIsModalActive(false);
  };

  const transferAllEntitiesToClockify = async () => {
    setIsTransferring(true);
    const workspaceRecords = Object.values(props.togglWorkspacesById);
    for (const workspaceRecord of workspaceRecords) {
      await props.onTransferEntitiesToClockifyWorkspace(workspaceRecord);
    }
    setIsTransferring(false);
  };

  const handleModalConfirmClick = () => {
    setIsModalActive(false);
    transferAllEntitiesToClockify()
      .then(props.next)
      .catch(props.next);
  };

  const fetchedName = props.workspaceNameBeingFetched;

  return (
    <If condition={isFetching || isTransferring}>
      <Then>
        <Loader>
          <When condition={isFetching}>
            Fetching Clockify entities, please wait...
          </When>
          <When condition={isTransferring}>
            Transferring entities to Clockify for {fetchedName}, please wait...
          </When>
        </Loader>
      </Then>
      <Else>
        <EntitiesReviewPage
          stepNumber={props.stepNumber}
          subtitle="Review Pending Data Before Transfer"
          entitiesByWorkspaceId={props.togglInclusionsByWorkspaceId}
          workspacesById={props.togglWorkspacesById}
          previous={props.previous}
          next={handleNextClick}
        >
          <p
            className={css`
              margin-bottom: 1rem;
            `}
          >
            This page contains all the records that <strong>will </strong> be
            created on Clockify once you press the <strong>Next </strong>
            button and confirm. If any of the records you selected in the
            previous step already existed on Clockify, you won't see them
            here...because they already exist.
          </p>
          <p
            className={css`
              margin-bottom: 1rem;
            `}
          >
            If you see something here that you <strong>don't</strong> want
            transferred, press the <strong>Previous</strong> button to go back
            and uncheck it.
          </p>
        </EntitiesReviewPage>
      </Else>
      <ConfirmationModal
        isActive={isModalActive}
        onConfirmClick={handleModalConfirmClick}
        onCancelClick={() => setIsModalActive(false)}
      />
    </If>
  );
};

const mapStateToProps = (state: ReduxState) => ({
  clockifyWorkspacesById: selectClockifyIncludedWorkspacesById(state),
  togglInclusionsByWorkspaceId: selectTogglInclusionsByWorkspaceId(state),
  togglWorkspacesById: selectTogglIncludedWorkspacesById(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchClockifyEntitiesInWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(fetchClockifyEntitiesInWorkspace(workspaceRecord)),
  onFetchClockifyWorkspaces: () => dispatch(fetchClockifyWorkspaces()),
  onTransferEntitiesToClockifyWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(transferEntitiesToClockifyWorkspace(workspaceRecord)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, StepPageProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ReviewClockifyDetailsStepComponent);
