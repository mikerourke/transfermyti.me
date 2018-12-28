import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import EntityTabs from './components/EntityTabs';
import {
  selectTogglIncludedWorkspaceIds,
  selectTogglWorkspaceAndYearRecords,
} from '../../../redux/entities/workspaces/workspacesSelectors';
import { fetchTogglTimeEntries } from '../../../redux/entities/timeEntries/timeEntriesActions';
import StepPage from '../../../components/stepPage/StepPage';
import { ReduxDispatch, ReduxState } from '../../../types/commonTypes';
import { WorkspaceAndYearModel } from '../../../types/workspacesTypes';
import { fetchTogglClients } from '../../../redux/entities/clients/clientsActions';
import { fetchTogglProjects } from '../../../redux/entities/projects/projectsActions';
import { fetchTogglTags } from '../../../redux/entities/tags/tagsActions';
import { fetchTogglTasks } from '../../../redux/entities/tasks/tasksActions';
import { selectTogglClientRecords } from '../../../redux/entities/clients/clientsSelectors';
import { selectTogglProjectRecords } from '../../../redux/entities/projects/projectsSelectors';
import { selectTogglTagRecords } from '../../../redux/entities/tags/tagsSelectors';
import { selectTogglTaskRecords } from '../../../redux/entities/tasks/tasksSelectors';
import { selectTogglTimeEntryRecords } from '../../../redux/entities/timeEntries/timeEntriesSelectors';
import Loader from '../../../components/loader/Loader';

interface ConnectStateProps {
  workspaceIds: string[];
  workspaceAndYearRecords: WorkspaceAndYearModel[];
  clientRecords: any[];
  projectRecords: any[];
  tagRecords: any[];
  taskRecords: any[];
  timeEntryRecords: any[];
}

interface ConnectDispatchProps {
  onFetchTogglClients: (workspaceId: string) => Promise<any>;
  onFetchTogglProjects: (workspaceId: string) => Promise<any>;
  onFetchTogglTags: (workspaceId: string) => Promise<any>;
  onFetchTogglTasks: (workspaceId: string) => Promise<any>;
  onFetchTogglTimeEntries: (workspaceId: string, year: number) => Promise<any>;
}

interface OwnProps {
  previous: () => void;
  next: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & OwnProps;

interface State {
  isDataFetching: boolean;
}

export class TogglReviewStepComponent extends React.Component<Props, State> {
  state = {
    isDataFetching: true,
  };

  public componentDidMount() {
    this.fetchEntitiesForAllWorkspaces()
      .then(this.fetchTimeEntriesForAllWorkspaces)
      .then(() => {
        this.setState({ isDataFetching: false });
      });
  }

  private fetchEntitiesForAllWorkspaces = async () => {
    for (const workspaceId of this.props.workspaceIds) {
      await this.fetchEntitiesForWorkspace(workspaceId);
    }
  };

  private fetchEntitiesForWorkspace = async (workspaceId: string) => {
    await this.props.onFetchTogglClients(workspaceId);
    await this.props.onFetchTogglProjects(workspaceId);
    await this.props.onFetchTogglTags(workspaceId);
    await this.props.onFetchTogglTasks(workspaceId);
  };

  private fetchTimeEntriesForAllWorkspaces = async () => {
    for (const { id, year } of this.props.workspaceAndYearRecords) {
      await this.props.onFetchTogglTimeEntries(id, year);
    }
  };

  public render() {
    if (this.state.isDataFetching) {
      return <Loader message="Fetching data, please wait..." />;
    }

    return (
      <StepPage
        title="Step 3:"
        subtitle="Review Toggl Data Before Transfer"
        onPreviousClick={this.props.previous}
        onNextClick={this.props.next}
      >
        <p
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          Pick which Workspaces and years you want to transfer to Clockify. If
          you want a preview of what's being transferred, press the
          <strong> Preview</strong> button after making your selections.
        </p>
        <p
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          Once you're done, press the <strong>Next</strong> button to move to
          the last step!
        </p>
        <EntityTabs />
      </StepPage>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  workspaceIds: selectTogglIncludedWorkspaceIds(state),
  workspaceAndYearRecords: selectTogglWorkspaceAndYearRecords(state),
  clientRecords: selectTogglClientRecords(state),
  projectRecords: selectTogglProjectRecords(state),
  tagRecords: selectTogglTagRecords(state),
  taskRecords: selectTogglTaskRecords(state),
  timeEntryRecords: selectTogglTimeEntryRecords(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchTogglClients: (workspaceId: string) =>
    dispatch(fetchTogglClients(workspaceId)),
  onFetchTogglProjects: (workspaceId: string) =>
    dispatch(fetchTogglProjects(workspaceId)),
  onFetchTogglTags: (workspaceId: string) =>
    dispatch(fetchTogglTags(workspaceId)),
  onFetchTogglTasks: (workspaceId: string) =>
    dispatch(fetchTogglTasks(workspaceId)),
  onFetchTogglTimeEntries: (workspaceId: string, year: number) =>
    dispatch(fetchTogglTimeEntries(workspaceId, year)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(TogglReviewStepComponent);
