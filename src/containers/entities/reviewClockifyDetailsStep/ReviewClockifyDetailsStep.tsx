import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import {
  fetchClockifyEntitiesInWorkspace,
  fetchClockifyWorkspaces,
  transferEntitiesToClockifyWorkspace,
} from '../../../redux/entities/workspaces/workspacesActions';
import {
  selectTogglEntityInclusionsByWorkspaceId,
  selectClockifyIncludedWorkspacesById,
  selectTogglIncludedWorkspacesById,
  selectWorkspaceNameBeingFetched,
} from '../../../redux/entities/workspaces/workspacesSelectors';
import EntitiesReviewPage from '../../../components/entitiesReviewPage/EntitiesReviewPage';
import Loader from '../../../components/loader/Loader';
import ConfirmationModal from './components/ConfirmationModal';
import {
  EntityGroup,
  EntityModel,
  ReduxDispatch,
  ReduxState,
} from '../../../types/commonTypes';
import { WorkspaceModel } from '../../../types/workspacesTypes';

interface ConnectStateProps {
  togglInclusionsByWorkspaceId: Record<
    string,
    Record<EntityGroup, EntityModel[]>
  >;
  clockifyWorkspacesById: Record<string, WorkspaceModel>;
  togglWorkspacesById: Record<string, WorkspaceModel>;
  workspaceNameBeingFetched: string;
}

interface ConnectDispatchProps {
  onFetchClockifyWorkspaces: () => Promise<any>;
  onFetchClockifyEntitiesInWorkspace: (
    workspaceRecord: WorkspaceModel,
  ) => Promise<any>;
  onTransferEntitiesToClockifyWorkspace: (
    workspaceRecord: WorkspaceModel,
  ) => Promise<any>;
}

interface OwnProps {
  previous: () => void;
  next: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & OwnProps;

interface State {
  isFetching: boolean;
  isTransferring: boolean;
  isModalActive: boolean;
}

export class ReviewClockifyDetailsStepComponent extends React.Component<
  Props,
  State
> {
  state = {
    isFetching: true,
    isTransferring: false,
    isModalActive: false,
  };

  public componentDidMount(): void {
    this.props
      .onFetchClockifyWorkspaces()
      .then(this.fetchClockifyEntitiesInAllWorkspaces)
      .then(() => {
        this.setState({ isFetching: false });
      })
      .catch(() => {
        this.setState({ isFetching: false });
      });
  }

  private fetchClockifyEntitiesInAllWorkspaces = async () => {
    const workspaceRecords = Object.values(this.props.clockifyWorkspacesById);
    if (workspaceRecords.length === 0) return Promise.resolve();

    for (const workspaceRecord of workspaceRecords) {
      await this.props.onFetchClockifyEntitiesInWorkspace(workspaceRecord);
    }
  };

  private handleNextClick = (): void => {
    this.setState({ isModalActive: true });
  };

  private transferAllEntitiesToClockify = async () => {
    this.setState({ isTransferring: true });
    const workspaceRecords = Object.values(this.props.togglWorkspacesById);
    for (const workspaceRecord of workspaceRecords) {
      await this.props.onTransferEntitiesToClockifyWorkspace(workspaceRecord);
    }
    this.setState({ isTransferring: false });
  };

  private handleModalConfirmClick = () => {
    this.setState({ isModalActive: false });
    this.transferAllEntitiesToClockify()
      .then(() => this.props.next())
      .catch(() => this.props.next());
  };

  private handleModalCancelClick = () => {
    this.setState({ isModalActive: false });
  };

  public render() {
    if (this.state.isFetching) {
      return <Loader>Fetching Clockify entities, please wait...</Loader>;
    }

    const { workspaceNameBeingFetched } = this.props;
    if (this.state.isTransferring) {
      return (
        <Loader>
          Transferring entities to Clockify for {workspaceNameBeingFetched},
          please wait...
        </Loader>
      );
    }

    return (
      <>
        <EntitiesReviewPage
          title="Step 4:"
          subtitle="Review Pending Data Before Transfer"
          entitiesByWorkspaceId={this.props.togglInclusionsByWorkspaceId}
          workspacesById={this.props.togglWorkspacesById}
          previous={this.props.previous}
          next={this.handleNextClick}
        >
          <p
            className={css`
              margin-bottom: 1.25rem;
            `}
          >
            This page contains all the records that <strong>will</strong> be
            created on Clockify once you press the <strong>Next </strong>
            button and confirm. If any of the records you selected in the
            previous step already existed on Clockify, you won't see them
            here...because they already exist.
          </p>
          <p
            className={css`
              margin-bottom: 1.25rem;
            `}
          >
            If you see something here that you <strong>don't</strong> want
            transferred, press the <strong>Previous</strong> button to go back
            and uncheck it.
          </p>
        </EntitiesReviewPage>
        <ConfirmationModal
          isActive={this.state.isModalActive}
          onConfirmClick={this.handleModalConfirmClick}
          onCancelClick={this.handleModalCancelClick}
        />
      </>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  togglInclusionsByWorkspaceId: selectTogglEntityInclusionsByWorkspaceId(state),
  clockifyWorkspacesById: selectClockifyIncludedWorkspacesById(state),
  togglWorkspacesById: selectTogglIncludedWorkspacesById(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchClockifyWorkspaces: () => dispatch(fetchClockifyWorkspaces()),
  onFetchClockifyEntitiesInWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(fetchClockifyEntitiesInWorkspace(workspaceRecord)),
  onTransferEntitiesToClockifyWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(transferEntitiesToClockifyWorkspace(workspaceRecord)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ReviewClockifyDetailsStepComponent);
