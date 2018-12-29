import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { List, ListRowProps } from 'react-virtualized';
import isNil from 'lodash/isNil';
import { fetchTogglEntitiesForWorkspace } from '../../../redux/entities/workspaces/workspacesActions';
import {
  selectTogglIncludedWorkspacesById,
  selectTogglWorkspaceEntities,
  selectWorkspaceEntitiesFetchDetails,
} from '../../../redux/entities/workspaces/workspacesSelectors';
import Loader from '../../../components/loader/Loader';
import StepPage from '../../../components/stepPage/StepPage';
import BasicListItem from './components/BasicListItem';
import EntityTabs from './components/EntityTabs';
import {
  EntityGroup,
  ReduxDispatch,
  ReduxState,
} from '../../../types/commonTypes';
import {
  EntityModel,
  WorkspaceEntitiesFetchDetailsModel,
  WorkspaceEntitiesModel,
  WorkspaceModel,
} from '../../../types/workspacesTypes';
import TimeEntryListItem from './components/TimeEntryListItem';
import { TimeEntryModel } from '../../../types/timeEntriesTypes';

interface ConnectStateProps {
  workspaceEntities: WorkspaceEntitiesModel;
  workspacesById: Record<string, WorkspaceModel>;
  entitiesFetchDetails: WorkspaceEntitiesFetchDetailsModel;
}

interface ConnectDispatchProps {
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
  activeTab: EntityGroup;
  tableWidth: number;
}

interface ColumnDescriptor {
  field: string;
  width: number;
  flexGrow: number;
}

export class TogglReviewStepComponent extends React.Component<Props, State> {
  private stepPageRef: HTMLDivElement;

  constructor(props: Props) {
    super(props);

    this.stepPageRef = null;
    this.state = {
      activeTab: EntityGroup.Projects,
      tableWidth: 0,
    };
  }

  public componentDidMount() {
    const width = this.stepPageRef.clientWidth;
    this.fetchEntitiesForAllWorkspaces().then(() => {
      this.setState({ tableWidth: width });
    });
  }

  private fetchEntitiesForAllWorkspaces = async () => {
    const workspaceRecords = Object.values(this.props.workspacesById);
    for (const workspaceRecord of workspaceRecords) {
      await this.props.onFetchEntitiesForWorkspace(workspaceRecord);
    }
  };

  private getRowRenderer = (activeEntities: EntityModel[]) => (
    listRowProps: ListRowProps,
  ) => {
    const entityRecord = activeEntities[listRowProps.index];
    if (this.state.activeTab === EntityGroup.TimeEntries) {
      return (
        <TimeEntryListItem
          entityRecord={entityRecord as TimeEntryModel}
          {...listRowProps}
        />
      );
    }

    return <BasicListItem entityRecord={entityRecord} {...listRowProps} />;
  };

  private handleTabClick = (entityGroup: EntityGroup) => {
    this.setState({ activeTab: entityGroup });
  };

  private handleRowClick = ({ rowData }: { rowData: EntityModel }) => {
    console.log(rowData);
  };

  public render() {
    const { entityName, workspaceName } = this.props.entitiesFetchDetails;
    if (!isNil(entityName) || !isNil(workspaceName)) {
      const message = `Fetching ${entityName} in ${workspaceName}...`;
      return <Loader message={message} />;
    }

    const { activeTab } = this.state;
    const activeEntities = this.props.workspaceEntities[activeTab];
    const rowHeight = activeTab === EntityGroup.TimeEntries ? 120 : 64;

    return (
      <StepPage
        title="Step 3:"
        subtitle="Review Toggl Data Before Transfer"
        onPreviousClick={this.props.previous}
        onNextClick={this.props.next}
        contentRef={element => (this.stepPageRef = element)}
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
        <EntityTabs
          activeTab={this.state.activeTab}
          onTabClick={this.handleTabClick}
        />
        <List
          width={this.state.tableWidth}
          height={500}
          rowHeight={rowHeight}
          rowClassName={css`
            cursor: pointer;
          `}
          rowCount={activeEntities.length}
          rowRenderer={this.getRowRenderer(activeEntities)}
          onRowClick={this.handleRowClick as any}
        />
      </StepPage>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  workspaceEntities: selectTogglWorkspaceEntities(state),
  workspacesById: selectTogglIncludedWorkspacesById(state),
  entitiesFetchDetails: selectWorkspaceEntitiesFetchDetails(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchEntitiesForWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(fetchTogglEntitiesForWorkspace(workspaceRecord)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(TogglReviewStepComponent);
