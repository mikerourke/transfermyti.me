import React from 'react';
import { connect } from 'react-redux';
import {
  fetchClockifyEntitiesForWorkspace,
  fetchClockifyWorkspaces,
} from '../../../redux/entities/workspaces/workspacesActions';
import {
  selectClockifyEntitiesByEntityGroup,
  selectClockifyWorkspacesById,
} from '../../../redux/entities/workspaces/workspacesSelectors';
import Loader from '../../../components/loader/Loader';
import StepPage from '../../../components/stepPage/StepPage';
import {
  EntityGroup,
  EntityModel,
  ReduxDispatch,
  ReduxState,
} from '../../../types/commonTypes';
import { WorkspaceModel } from '../../../types/workspacesTypes';
import { css } from 'emotion';

interface ConnectStateProps {
  entitiesByEntityGroup: Partial<Record<EntityGroup, EntityModel[]>>;
  workspacesById: Record<string, WorkspaceModel>;
}

interface ConnectDispatchProps {
  onFetchWorkspaces: () => Promise<any>;
  onFetchEntitiesForWorkspace: (
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
}

export class ReviewClockifyDetailsStepComponent extends React.Component<
  Props,
  State
> {
  state = {
    isFetching: true,
  };

  public componentDidMount(): void {
    this.props
      .onFetchWorkspaces()
      .then(this.fetchEntitiesForAllWorkspaces)
      .then(() => this.setState({ isFetching: false }))
      .catch(() => this.setState({ isFetching: false }));
  }

  private fetchEntitiesForAllWorkspaces = async () => {
    const workspaceRecords = Object.values(this.props.workspacesById);
    for (const workspaceRecord of workspaceRecords) {
      await this.props.onFetchEntitiesForWorkspace(workspaceRecord);
    }
  };

  public render() {
    if (this.state.isFetching) {
      return <Loader>Fetching Clockify entities, please wait...</Loader>;
    }

    return (
      <StepPage
        title="Step 4:"
        subtitle="Review Pending Data Before Transfer"
        onPreviousClick={this.props.previous}
        onNextClick={this.props.next}
      >
        <p
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          Select which entities/records you want to transfer and press the
          <strong> Next</strong> button when you're ready. There are a few
          things to be aware of:
        </p>
      </StepPage>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  entitiesByEntityGroup: selectClockifyEntitiesByEntityGroup(state),
  workspacesById: selectClockifyWorkspacesById(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchWorkspaces: () => dispatch(fetchClockifyWorkspaces()),
  onFetchEntitiesForWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(fetchClockifyEntitiesForWorkspace(workspaceRecord)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(ReviewClockifyDetailsStepComponent);
