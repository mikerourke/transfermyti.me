import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { List, ListRowProps } from 'react-virtualized';
import first from 'lodash/first';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import {
  fetchTogglEntitiesForWorkspace,
  updateIsWorkspaceEntityIncluded,
} from '../../../redux/entities/workspaces/workspacesActions';
import {
  selectTogglEntitiesByWorkspaceId,
  selectTogglIncludedWorkspacesById,
  selectWorkspaceNameBeingFetched,
} from '../../../redux/entities/workspaces/workspacesSelectors';
import Loader from '../../../components/loader/Loader';
import StepPage from '../../../components/stepPage/StepPage';
import BasicListItem from './components/BasicListItem';
import EntityTabs from './components/EntityTabs';
import InstructionsList from './components/InstructionsList';
import TimeEntryListItem from './components/TimeEntryListItem';
import WorkspacesDropdown from './components/WorkspacesDropdown';
import {
  EntityGroup,
  EntityModel,
  ReduxDispatch,
  ReduxState,
} from '../../../types/commonTypes';
import { DetailedTimeEntryModel } from '../../../types/timeEntriesTypes';
import { WorkspaceModel } from '../../../types/workspacesTypes';

interface ConnectStateProps {
  entitiesByWorkspaceId: Record<string, Record<EntityGroup, EntityModel[]>>;
  workspaceNameBeingFetched: string;
  workspacesById: Record<string, WorkspaceModel>;
}

interface ConnectDispatchProps {
  onFetchEntitiesForWorkspace: (
    workspaceRecord: WorkspaceModel,
  ) => Promise<any>;
  onUpdateIsWorkspaceEntityIncluded: (
    entityGroup: EntityGroup,
    entityRecord: EntityModel,
  ) => void;
}

interface OwnProps {
  previous: () => void;
  next: () => void;
}

type Props = ConnectStateProps & ConnectDispatchProps & OwnProps;

interface State {
  activeWorkspaceId: string;
  activeEntityGroup: EntityGroup;
  tableWidth: number;
}

export class SelectTogglInclusionsStepComponent extends React.Component<
  Props,
  State
> {
  private stepPageRef: HTMLDivElement;

  constructor(props: Props) {
    super(props);

    this.stepPageRef = null;
    this.state = {
      activeWorkspaceId: first(Object.keys(props.workspacesById)),
      activeEntityGroup: EntityGroup.Projects,
      tableWidth: 0,
    };
  }

  public componentDidMount(): void {
    window.addEventListener('resize', this.updateTableWidth);
    this.fetchEntitiesForAllWorkspaces()
      .then(() => this.updateTableWidth())
      .catch(() => this.updateTableWidth());
  }

  public componentWillUnmount(): void {
    window.removeEventListener('resize', this.updateTableWidth);
  }

  private updateTableWidth = (): void => {
    if (this.stepPageRef) {
      const tableWidth = this.stepPageRef.clientWidth;
      this.setState({ tableWidth });
    }
  };

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
    const handleOnItemClick = () =>
      this.props.onUpdateIsWorkspaceEntityIncluded(
        this.state.activeEntityGroup,
        entityRecord,
      );

    if (this.state.activeEntityGroup === EntityGroup.TimeEntries) {
      return (
        <TimeEntryListItem
          entityRecord={entityRecord as DetailedTimeEntryModel}
          {...listRowProps}
        />
      );
    }

    return (
      <BasicListItem
        entityRecord={entityRecord}
        onItemClick={handleOnItemClick}
        {...listRowProps}
      />
    );
  };

  private handleTabClick = (entityGroup: EntityGroup) => {
    this.setState({ activeEntityGroup: entityGroup });
  };

  private handleWorkspaceItemClick = (workspaceId: string) => {
    this.setState({ activeWorkspaceId: workspaceId });
  };

  public render() {
    const wsName = this.props.workspaceNameBeingFetched;
    if (!isNil(wsName)) {
      return (
        <Loader>
          <span>
            Fetching entities in <strong>{wsName}</strong> workspace...
          </span>
        </Loader>
      );
    }

    const { activeEntityGroup, activeWorkspaceId } = this.state;
    const activeEntities = get(
      this.props.entitiesByWorkspaceId,
      [activeWorkspaceId, activeEntityGroup],
      [],
    );
    const rowHeight = activeEntityGroup === EntityGroup.TimeEntries ? 120 : 64;
    const rowRenderer = this.getRowRenderer(activeEntities);

    return (
      <StepPage
        title="Step 3:"
        subtitle="Select Toggl Records to Transfer"
        onPreviousClick={this.props.previous}
        onNextClick={this.props.next}
        contentRef={element => (this.stepPageRef = element)}
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
        <div
          className={css`
            margin-bottom: 1.25rem;
          `}
        >
          <InstructionsList />
        </div>
        <WorkspacesDropdown
          workspacesById={this.props.workspacesById}
          activeWorkspaceId={activeWorkspaceId}
          onItemClick={this.handleWorkspaceItemClick}
        />
        <EntityTabs
          activeTab={activeEntityGroup}
          onTabClick={this.handleTabClick}
        />
        <List
          width={this.state.tableWidth}
          height={500}
          className={css`
            max-height: 450px;
            &:focus {
              outline: 0;
            }
          `}
          rowHeight={rowHeight}
          rowClassName={css`
            cursor: pointer;
          `}
          rowCount={activeEntities.length}
          rowRenderer={rowRenderer}
        />
      </StepPage>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  entitiesByWorkspaceId: selectTogglEntitiesByWorkspaceId(state),
  workspacesById: selectTogglIncludedWorkspacesById(state),
  workspaceNameBeingFetched: selectWorkspaceNameBeingFetched(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onFetchEntitiesForWorkspace: (workspaceRecord: WorkspaceModel) =>
    dispatch(fetchTogglEntitiesForWorkspace(workspaceRecord)),
  onUpdateIsWorkspaceEntityIncluded: (
    entityGroup: EntityGroup,
    entityRecord: EntityModel,
  ) => dispatch(updateIsWorkspaceEntityIncluded(entityGroup, entityRecord)),
});

export default connect<ConnectStateProps, ConnectDispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(SelectTogglInclusionsStepComponent);
